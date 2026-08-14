import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../api.dart';
import 'attendance_screen.dart';
import 'pickups_screen.dart';
import 'deliveries_screen.dart';
import 'scan_screen.dart';
import 'settlement_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.api, required this.onLogout});

  final RiderApi api;
  final VoidCallback onLogout;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    _pingGps();
  }

  Future<void> _pingGps() async {
    try {
      final enabled = await Geolocator.isLocationServiceEnabled();
      if (!enabled) return;
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied ||
          perm == LocationPermission.deniedForever) {
        return;
      }
      final pos = await Geolocator.getCurrentPosition();
      await widget.api.sendGps(
        lat: pos.latitude,
        lng: pos.longitude,
        accuracy: pos.accuracy,
      );
    } catch (_) {
      // GPS optional in demo
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      AttendanceScreen(api: widget.api, onLogout: widget.onLogout),
      PickupsScreen(api: widget.api),
      DeliveriesScreen(api: widget.api),
      ScanScreen(api: widget.api),
      SettlementScreen(api: widget.api),
    ];

    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.badge_outlined), label: 'Duty'),
          NavigationDestination(icon: Icon(Icons.inventory_2_outlined), label: 'Pickups'),
          NavigationDestination(icon: Icon(Icons.local_shipping_outlined), label: 'Deliver'),
          NavigationDestination(icon: Icon(Icons.qr_code_scanner), label: 'Scan'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Settle'),
        ],
      ),
    );
  }
}
