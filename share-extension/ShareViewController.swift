import UIKit
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    // MARK: - UI Elements
    private let containerView = UIView()
    private let iconLabel = UILabel()
    private let statusLabel = UILabel()
    private let spinner = UIActivityIndicatorView(style: .medium)

    // MARK: - Configuration
    private let apiURL = "https://shelf-wheat.vercel.app/api/share"
    // This key is replaced at build time by configure-ios.sh
    private let apiKey = "__SHARE_API_KEY__"
    private let appGroupID = "group.com.pieve.shelf"

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        extractAndSubmitURL()
    }

    // MARK: - UI Setup

    private func setupUI() {
        view.backgroundColor = UIColor.black.withAlphaComponent(0.4)

        // Container card
        containerView.backgroundColor = UIColor(red: 0.102, green: 0.094, blue: 0.078, alpha: 1.0) // #1a1814
        containerView.layer.cornerRadius = 20
        containerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(containerView)

        // Shelf icon (book emoji as placeholder)
        iconLabel.text = "📚"
        iconLabel.font = .systemFont(ofSize: 36)
        iconLabel.textAlignment = .center
        iconLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(iconLabel)

        // Status label
        statusLabel.text = "Saving to Shelf…"
        statusLabel.textColor = .white
        statusLabel.font = .systemFont(ofSize: 17, weight: .medium)
        statusLabel.textAlignment = .center
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(statusLabel)

        // Spinner
        spinner.color = UIColor(red: 0.063, green: 0.725, blue: 0.506, alpha: 1.0) // #10b981
        spinner.translatesAutoresizingMaskIntoConstraints = false
        spinner.startAnimating()
        containerView.addSubview(spinner)

        NSLayoutConstraint.activate([
            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalToConstant: 260),
            containerView.heightAnchor.constraint(equalToConstant: 160),

            iconLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 24),
            iconLabel.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),

            statusLabel.topAnchor.constraint(equalTo: iconLabel.bottomAnchor, constant: 12),
            statusLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            statusLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),

            spinner.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 12),
            spinner.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
        ])

        // Tap outside to dismiss
        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissExtension))
        tap.delegate = self
        view.addGestureRecognizer(tap)
    }

    // MARK: - URL Extraction & Submission

    private func extractAndSubmitURL() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            showError("No content received")
            return
        }

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }

            for provider in attachments {
                // Try URL type first
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] item, error in
                        DispatchQueue.main.async {
                            if let url = item as? URL {
                                self?.submitURL(url.absoluteString)
                            } else if let urlString = item as? String {
                                self?.submitURL(urlString)
                            } else {
                                self?.showError("Could not read URL")
                            }
                        }
                    }
                    return
                }

                // Try plain text (might contain a URL)
                if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] item, error in
                        DispatchQueue.main.async {
                            if let text = item as? String {
                                // Extract URL from text if present
                                if let url = self?.extractURL(from: text) {
                                    self?.submitURL(url)
                                } else {
                                    self?.submitURL(text)
                                }
                            } else {
                                self?.showError("Could not read content")
                            }
                        }
                    }
                    return
                }
            }
        }

        showError("No URL found")
    }

    private func extractURL(from text: String) -> String? {
        let detector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.link.rawValue)
        let range = NSRange(text.startIndex..., in: text)
        if let match = detector?.firstMatch(in: text, options: [], range: range),
           let url = match.url {
            return url.absoluteString
        }
        return nil
    }

    private func submitURL(_ urlString: String) {
        // Get device language for processing
        let language = Locale.current.language.languageCode?.identifier ?? "en"

        // Build request
        guard let requestURL = URL(string: apiURL) else {
            showError("Invalid API URL")
            return
        }

        var request = URLRequest(url: requestURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30

        let body: [String: Any] = [
            "url": urlString,
            "api_key": apiKey,
            "language": language
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            showError("Failed to encode request")
            return
        }

        // Fire and forget — show success immediately, don't wait for processing
        let task = URLSession.shared.dataTask(with: request) { _, _, _ in }
        task.resume()
        showSuccess()
    }

    // MARK: - Status Updates

    private func showSuccess() {
        spinner.stopAnimating()
        iconLabel.text = "✅"
        statusLabel.text = "Saved to Shelf!"
        statusLabel.textColor = UIColor(red: 0.063, green: 0.725, blue: 0.506, alpha: 1.0) // #10b981

        // Auto-dismiss after 1.2 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil)
        }
    }

    private func showError(_ message: String) {
        spinner.stopAnimating()
        iconLabel.text = "⚠️"
        statusLabel.text = message
        statusLabel.textColor = UIColor(red: 0.94, green: 0.27, blue: 0.27, alpha: 1.0) // red

        // Auto-dismiss after 2 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil)
        }
    }

    @objc private func dismissExtension() {
        extensionContext?.completeRequest(returningItems: nil)
    }
}

// MARK: - UIGestureRecognizerDelegate

extension ShareViewController: UIGestureRecognizerDelegate {
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        // Only dismiss when tapping outside the container
        let location = touch.location(in: view)
        return !containerView.frame.contains(location)
    }
}
