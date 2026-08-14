/// QuickFynd Express Rider API client
class ApiConfig {
  /// Change to your machine IP when testing on a physical device.
  /// Android emulator: use 10.0.2.2 instead of localhost.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://10.0.2.2:3000',
  );
}
