import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api.dart';
import 'screens/login_screen.dart';
import 'screens/home_shell.dart';

const brandRed = Color(0xFFE61E43);

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const QuickFyndRiderApp());
}

class QuickFyndRiderApp extends StatelessWidget {
  const QuickFyndRiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QuickFynd Rider',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: brandRed,
          primary: brandRed,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
        ),
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  String? _token;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _token = prefs.getString('token');
      _loading = false;
    });
  }

  Future<void> _onLoggedIn(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    setState(() => _token = token);
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    setState(() => _token = null);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_token == null) {
      return LoginScreen(onLoggedIn: _onLoggedIn);
    }
    return HomeShell(api: RiderApi(token: _token), onLogout: _logout);
  }
}
