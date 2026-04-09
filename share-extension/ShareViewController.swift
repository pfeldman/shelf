import UIKit
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    // MARK: - Colors
    private let bgDark = UIColor(red: 0.102, green: 0.094, blue: 0.078, alpha: 1.0)    // #1a1814
    private let accentGreen = UIColor(red: 0.063, green: 0.725, blue: 0.506, alpha: 1.0) // #10b981
    private let creamWhite = UIColor(red: 0.96, green: 0.94, blue: 0.92, alpha: 1.0)     // #f5f0eb
    private let subtleGray = UIColor(red: 0.66, green: 0.63, blue: 0.60, alpha: 1.0)     // #a8a099

    // MARK: - UI Elements
    private let blurView = UIVisualEffectView(effect: nil)
    private let pillView = UIView()
    private let iconContainer = UIView()
    private let shelfIcon = ShelfIconView()
    private let checkmarkView = CheckmarkView()
    private let statusLabel = UILabel()
    private let progressBar = UIView()
    private let progressFill = UIView()

    // MARK: - Configuration
    private let apiURL = "https://shelf-wheat.vercel.app/api/share"
    private let apiKey = "__SHARE_API_KEY__"

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .clear
        setupUI()
        animateIn()
        extractAndSubmitURL()
    }

    // MARK: - UI Setup

    private func setupUI() {
        // Full-screen blur
        blurView.frame = view.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(blurView)

        // Tap to dismiss
        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissExtension))
        blurView.addGestureRecognizer(tap)

        // Floating pill
        pillView.backgroundColor = bgDark
        pillView.layer.cornerRadius = 28
        pillView.layer.shadowColor = UIColor.black.cgColor
        pillView.layer.shadowOffset = CGSize(width: 0, height: 8)
        pillView.layer.shadowRadius = 24
        pillView.layer.shadowOpacity = 0.5
        pillView.layer.borderWidth = 0.5
        pillView.layer.borderColor = UIColor.white.withAlphaComponent(0.08).cgColor
        pillView.translatesAutoresizingMaskIntoConstraints = false
        pillView.alpha = 0
        pillView.transform = CGAffineTransform(translationX: 0, y: 30).scaledBy(x: 0.9, y: 0.9)
        view.addSubview(pillView)

        // Icon container with subtle glow
        iconContainer.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.backgroundColor = accentGreen.withAlphaComponent(0.12)
        iconContainer.layer.cornerRadius = 20
        pillView.addSubview(iconContainer)

        // Custom shelf icon (drawn with Core Graphics)
        shelfIcon.translatesAutoresizingMaskIntoConstraints = false
        shelfIcon.tintColor = accentGreen
        shelfIcon.backgroundColor = .clear
        iconContainer.addSubview(shelfIcon)

        // Checkmark (hidden initially)
        checkmarkView.translatesAutoresizingMaskIntoConstraints = false
        checkmarkView.tintColor = accentGreen
        checkmarkView.backgroundColor = .clear
        checkmarkView.alpha = 0
        iconContainer.addSubview(checkmarkView)

        // Status text
        statusLabel.text = "Saving…"
        statusLabel.textColor = creamWhite
        statusLabel.font = .systemFont(ofSize: 15, weight: .semibold)
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        pillView.addSubview(statusLabel)

        // Thin progress bar at bottom of pill
        progressBar.backgroundColor = UIColor.white.withAlphaComponent(0.06)
        progressBar.layer.cornerRadius = 1.5
        progressBar.translatesAutoresizingMaskIntoConstraints = false
        progressBar.clipsToBounds = true
        pillView.addSubview(progressBar)

        progressFill.backgroundColor = accentGreen
        progressFill.layer.cornerRadius = 1.5
        progressFill.translatesAutoresizingMaskIntoConstraints = false
        progressBar.addSubview(progressFill)

        NSLayoutConstraint.activate([
            pillView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            pillView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            pillView.widthAnchor.constraint(greaterThanOrEqualToConstant: 180),
            pillView.heightAnchor.constraint(equalToConstant: 56),

            iconContainer.leadingAnchor.constraint(equalTo: pillView.leadingAnchor, constant: 8),
            iconContainer.centerYAnchor.constraint(equalTo: pillView.centerYAnchor),
            iconContainer.widthAnchor.constraint(equalToConstant: 40),
            iconContainer.heightAnchor.constraint(equalToConstant: 40),

            shelfIcon.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            shelfIcon.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),
            shelfIcon.widthAnchor.constraint(equalToConstant: 22),
            shelfIcon.heightAnchor.constraint(equalToConstant: 22),

            checkmarkView.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            checkmarkView.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),
            checkmarkView.widthAnchor.constraint(equalToConstant: 22),
            checkmarkView.heightAnchor.constraint(equalToConstant: 22),

            statusLabel.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 10),
            statusLabel.trailingAnchor.constraint(equalTo: pillView.trailingAnchor, constant: -20),
            statusLabel.centerYAnchor.constraint(equalTo: pillView.centerYAnchor),

            progressBar.leadingAnchor.constraint(equalTo: pillView.leadingAnchor, constant: 16),
            progressBar.trailingAnchor.constraint(equalTo: pillView.trailingAnchor, constant: -16),
            progressBar.bottomAnchor.constraint(equalTo: pillView.bottomAnchor, constant: -8),
            progressBar.heightAnchor.constraint(equalToConstant: 3),

            progressFill.leadingAnchor.constraint(equalTo: progressBar.leadingAnchor),
            progressFill.topAnchor.constraint(equalTo: progressBar.topAnchor),
            progressFill.bottomAnchor.constraint(equalTo: progressBar.bottomAnchor),
            progressFill.widthAnchor.constraint(equalTo: progressBar.widthAnchor, multiplier: 0.0),
        ])
    }

    // MARK: - Animations

    private func animateIn() {
        // Blur in
        UIView.animate(withDuration: 0.3) {
            self.blurView.effect = UIBlurEffect(style: .dark)
        }

        // Pill spring in
        UIView.animate(withDuration: 0.5, delay: 0.05, usingSpringWithDamping: 0.7, initialSpringVelocity: 0.8) {
            self.pillView.alpha = 1
            self.pillView.transform = .identity
        }

        // Progress bar animation
        self.view.layoutIfNeeded()
        UIView.animate(withDuration: 0.8, delay: 0.2, options: .curveEaseOut) {
            self.progressFill.frame = CGRect(
                x: 0, y: 0,
                width: self.progressBar.frame.width,
                height: self.progressBar.frame.height
            )
        }
    }

    private func animateOut(completion: @escaping () -> Void) {
        UIView.animate(withDuration: 0.25, delay: 0, options: .curveEaseIn) {
            self.pillView.transform = CGAffineTransform(translationX: 0, y: -20)
            self.pillView.alpha = 0
        }
        UIView.animate(withDuration: 0.2, delay: 0.1) {
            self.blurView.effect = nil
        } completion: { _ in
            completion()
        }
    }

    // MARK: - URL Extraction & Submission

    private func extractAndSubmitURL() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            showError()
            return
        }

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }
            for provider in attachments {
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] item, _ in
                        DispatchQueue.main.async {
                            if let url = item as? URL {
                                self?.submitURL(url.absoluteString)
                            } else if let urlString = item as? String {
                                self?.submitURL(urlString)
                            } else {
                                self?.showError()
                            }
                        }
                    }
                    return
                }
                if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] item, _ in
                        DispatchQueue.main.async {
                            if let text = item as? String {
                                if let url = self?.extractURL(from: text) {
                                    self?.submitURL(url)
                                } else {
                                    self?.submitURL(text)
                                }
                            } else {
                                self?.showError()
                            }
                        }
                    }
                    return
                }
            }
        }
        showError()
    }

    private func extractURL(from text: String) -> String? {
        let detector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.link.rawValue)
        let range = NSRange(text.startIndex..., in: text)
        if let match = detector?.firstMatch(in: text, options: [], range: range), let url = match.url {
            return url.absoluteString
        }
        return nil
    }

    private func submitURL(_ urlString: String) {
        let language = Locale.current.language.languageCode?.identifier ?? "en"
        guard let requestURL = URL(string: apiURL) else { showError(); return }

        var request = URLRequest(url: requestURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30
        request.httpBody = try? JSONSerialization.data(withJSONObject: [
            "url": urlString, "api_key": apiKey, "language": language
        ])

        // Fire and forget
        URLSession.shared.dataTask(with: request) { _, _, _ in }.resume()
        showSuccess()
    }

    // MARK: - Status

    private func showSuccess() {
        // Crossfade icon → checkmark
        UIView.animate(withDuration: 0.2) {
            self.shelfIcon.alpha = 0
            self.shelfIcon.transform = CGAffineTransform(scaleX: 0.5, y: 0.5)
        }
        UIView.animate(withDuration: 0.3, delay: 0.1, usingSpringWithDamping: 0.6, initialSpringVelocity: 1.0) {
            self.checkmarkView.alpha = 1
            self.checkmarkView.transform = .identity
        }

        // Update label
        UIView.transition(with: statusLabel, duration: 0.2, options: .transitionCrossDissolve) {
            self.statusLabel.text = "Saved"
            self.statusLabel.textColor = self.accentGreen
        }

        // Subtle icon container glow
        UIView.animate(withDuration: 0.3) {
            self.iconContainer.backgroundColor = self.accentGreen.withAlphaComponent(0.2)
        }

        // Animate checkmark stroke
        checkmarkView.animateStroke()

        // Dismiss
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            self?.animateOut {
                self?.extensionContext?.completeRequest(returningItems: nil)
            }
        }
    }

    private func showError() {
        UIView.transition(with: statusLabel, duration: 0.2, options: .transitionCrossDissolve) {
            self.statusLabel.text = "Failed"
            self.statusLabel.textColor = UIColor(red: 0.94, green: 0.27, blue: 0.27, alpha: 1.0)
        }
        UIView.animate(withDuration: 0.3) {
            self.iconContainer.backgroundColor = UIColor(red: 0.94, green: 0.27, blue: 0.27, alpha: 0.15)
            self.progressFill.backgroundColor = UIColor(red: 0.94, green: 0.27, blue: 0.27, alpha: 1.0)
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.animateOut {
                self?.extensionContext?.completeRequest(returningItems: nil)
            }
        }
    }

    @objc private func dismissExtension() {
        animateOut {
            self.extensionContext?.completeRequest(returningItems: nil)
        }
    }
}

// MARK: - Custom Shelf Icon (Core Graphics)

class ShelfIconView: UIView {
    override func draw(_ rect: CGRect) {
        guard let ctx = UIGraphicsGetCurrentContext() else { return }
        let color = tintColor ?? .white
        ctx.setStrokeColor(color.cgColor)
        ctx.setLineWidth(1.6)
        ctx.setLineCap(.round)
        ctx.setLineJoin(.round)

        let s = min(rect.width, rect.height)
        let o = CGPoint(x: (rect.width - s) / 2, y: (rect.height - s) / 2)

        // Book/shelf icon — open book shape
        let cx = o.x + s * 0.5
        // Left page
        ctx.move(to: CGPoint(x: cx, y: o.y + s * 0.18))
        ctx.addCurve(
            to: CGPoint(x: o.x + s * 0.1, y: o.y + s * 0.22),
            control1: CGPoint(x: cx - s * 0.08, y: o.y + s * 0.18),
            control2: CGPoint(x: o.x + s * 0.18, y: o.y + s * 0.16)
        )
        ctx.addLine(to: CGPoint(x: o.x + s * 0.1, y: o.y + s * 0.78))
        ctx.addCurve(
            to: CGPoint(x: cx, y: o.y + s * 0.82),
            control1: CGPoint(x: o.x + s * 0.18, y: o.y + s * 0.84),
            control2: CGPoint(x: cx - s * 0.08, y: o.y + s * 0.82)
        )
        ctx.strokePath()

        // Right page
        ctx.move(to: CGPoint(x: cx, y: o.y + s * 0.18))
        ctx.addCurve(
            to: CGPoint(x: o.x + s * 0.9, y: o.y + s * 0.22),
            control1: CGPoint(x: cx + s * 0.08, y: o.y + s * 0.18),
            control2: CGPoint(x: o.x + s * 0.82, y: o.y + s * 0.16)
        )
        ctx.addLine(to: CGPoint(x: o.x + s * 0.9, y: o.y + s * 0.78))
        ctx.addCurve(
            to: CGPoint(x: cx, y: o.y + s * 0.82),
            control1: CGPoint(x: o.x + s * 0.82, y: o.y + s * 0.84),
            control2: CGPoint(x: cx + s * 0.08, y: o.y + s * 0.82)
        )
        ctx.strokePath()

        // Spine
        ctx.move(to: CGPoint(x: cx, y: o.y + s * 0.15))
        ctx.addLine(to: CGPoint(x: cx, y: o.y + s * 0.85))
        ctx.strokePath()
    }
}

// MARK: - Animated Checkmark (Core Animation)

class CheckmarkView: UIView {
    private let checkLayer = CAShapeLayer()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        transform = CGAffineTransform(scaleX: 0.5, y: 0.5)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        checkLayer.removeFromSuperlayer()

        let path = UIBezierPath()
        let s = min(bounds.width, bounds.height)
        let o = CGPoint(x: (bounds.width - s) / 2, y: (bounds.height - s) / 2)
        path.move(to: CGPoint(x: o.x + s * 0.18, y: o.y + s * 0.52))
        path.addLine(to: CGPoint(x: o.x + s * 0.42, y: o.y + s * 0.74))
        path.addLine(to: CGPoint(x: o.x + s * 0.82, y: o.y + s * 0.28))

        checkLayer.path = path.cgPath
        checkLayer.strokeColor = (tintColor ?? .white).cgColor
        checkLayer.fillColor = UIColor.clear.cgColor
        checkLayer.lineWidth = 2.4
        checkLayer.lineCap = .round
        checkLayer.lineJoin = .round
        checkLayer.strokeEnd = 0
        layer.addSublayer(checkLayer)
    }

    func animateStroke() {
        let anim = CABasicAnimation(keyPath: "strokeEnd")
        anim.fromValue = 0
        anim.toValue = 1
        anim.duration = 0.35
        anim.timingFunction = CAMediaTimingFunction(name: .easeOut)
        anim.fillMode = .forwards
        anim.isRemovedOnCompletion = false
        checkLayer.add(anim, forKey: "stroke")
    }
}

// MARK: - UIGestureRecognizerDelegate

extension ShareViewController: UIGestureRecognizerDelegate {}
