// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Torboar",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "Torboar",
            targets: ["torboarPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "torboarPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/torboarPlugin"),
        .testTarget(
            name: "torboarPluginTests",
            dependencies: ["torboarPlugin"],
            path: "ios/Tests/torboarPluginTests")
    ]
)