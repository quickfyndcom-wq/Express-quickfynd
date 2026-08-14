import 'dart:convert';
import 'package:http/http.dart' as http;
import 'config.dart';

class RiderApi {
  RiderApi({this.token});

  String? token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/rider/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> me() => _get('/api/rider/me');

  Future<Map<String, dynamic>> checkIn() =>
      _post('/api/rider/attendance/check-in', {});

  Future<Map<String, dynamic>> checkOut() =>
      _post('/api/rider/attendance/check-out', {});

  Future<Map<String, dynamic>> pickups() => _get('/api/rider/pickups');

  Future<Map<String, dynamic>> deliveries() => _get('/api/rider/deliveries');

  Future<Map<String, dynamic>> scan(String awb) =>
      _post('/api/rider/scan', {'awb': awb});

  Future<Map<String, dynamic>> navigation(String taskId) =>
      _get('/api/rider/tasks/$taskId/navigation');

  Future<Map<String, dynamic>> customer(String taskId) =>
      _get('/api/rider/tasks/$taskId/customer');

  Future<Map<String, dynamic>> sendGps({
    required double lat,
    required double lng,
    double accuracy = 0,
  }) =>
      _post('/api/rider/gps', {
        'lat': lat,
        'lng': lng,
        'accuracy': accuracy,
      });

  Future<Map<String, dynamic>> sendOtp(String taskId) =>
      _post('/api/rider/otp/send', {'taskId': taskId});

  Future<Map<String, dynamic>> verifyOtp(String taskId, String otp) =>
      _post('/api/rider/otp/verify', {'taskId': taskId, 'otp': otp});

  Future<Map<String, dynamic>> submitPod({
    required String taskId,
    String? photoUrl,
    String? signatureUrl,
    bool otpVerified = false,
  }) =>
      _post('/api/rider/pod', {
        'taskId': taskId,
        'photoUrl': photoUrl,
        'signatureUrl': signatureUrl,
        'otpVerified': otpVerified,
      });

  Future<Map<String, dynamic>> collectCod({
    required String taskId,
    required num amount,
    String method = 'cash',
  }) =>
      _post('/api/rider/cod/collect', {
        'taskId': taskId,
        'amount': amount,
        'method': method,
      });

  Future<Map<String, dynamic>> failDelivery({
    required String taskId,
    required String reason,
    String notes = '',
  }) =>
      _post('/api/rider/delivery/failed', {
        'taskId': taskId,
        'reason': reason,
        'notes': notes,
      });

  Future<Map<String, dynamic>> settlement() => _get('/api/rider/settlement');

  Future<Map<String, dynamic>> submitSettlement(num cashHanded) =>
      _post('/api/rider/settlement', {'cashHanded': cashHanded});

  Future<Map<String, dynamic>> _get(String path) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers,
    );
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> body,
  ) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}
