import 'package:flutter/material.dart';
import '../api.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key, required this.api, required this.onLogout});

  final RiderApi api;
  final VoidCallback onLogout;

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  Map<String, dynamic>? _me;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await widget.api.me();
      setState(() => _me = res);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  Future<void> _checkIn() async {
    await widget.api.checkIn();
    await _load();
  }

  Future<void> _checkOut() async {
    await widget.api.checkOut();
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final rider = _me?['rider'] as Map<String, dynamic>?;
    final att = _me?['attendance'] as Map<String, dynamic>?;
    final counts = _me?['counts'] as Map<String, dynamic>?;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Login & Attendance'),
        actions: [
          IconButton(onPressed: widget.onLogout, icon: const Icon(Icons.logout)),
        ],
      ),
      body: _error != null
          ? Center(child: Text(_error!))
          : _me == null
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text(
                      rider?['name']?.toString() ?? '',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    Text('${rider?['hubId']} · ${rider?['vehicle']}'),
                    const SizedBox(height: 16),
                    Card(
                      child: ListTile(
                        title: const Text('Today'),
                        subtitle: Text(
                          'In: ${att?['checkInAt'] ?? '—'}\nOut: ${att?['checkOutAt'] ?? '—'}',
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: FilledButton(
                            onPressed: _checkIn,
                            child: const Text('Check in'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _checkOut,
                            child: const Text('Check out'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text('Open pickups: ${counts?['pickups'] ?? 0}'),
                    Text('Open deliveries: ${counts?['deliveries'] ?? 0}'),
                    const SizedBox(height: 8),
                    const Text(
                      'Live GPS starts when location permission is granted.',
                      style: TextStyle(color: Colors.black54),
                    ),
                  ],
                ),
    );
  }
}
