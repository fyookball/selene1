import Foundation

@objc public class torboar: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
