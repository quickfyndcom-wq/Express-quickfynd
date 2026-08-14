import 'package:flutter/material.dart';
import '../api.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key, required this.api});

  final RiderApi api;

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final _awb = TextEditingController();
  String? _result;

  Future<void> _scan() async {
    final res = await widget.api.scan(_awb.text.trim());
    setState(() {
      _result = res['ok'] == true
          ? 'Scanned ${res['scan']?['awb']} (${res['scan']?['type']})'
          : res['error']?.toString();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Parcel Barcode Scanner')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Enter AWB or use camera scanner (mobile_scanner) once permissions are set.',
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _awb,
              decoration: const InputDecoration(
                labelText: 'AWB / barcode',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _scan,
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Submit scan'),
            ),
            if (_result != null) ...[
              const SizedBox(height: 16),
              Text(_result!),
            ],
            const SizedBox(height: 24),
            const Text(
              'Demo AWBs: QF1000001001, QF2000002001',
              style: TextStyle(color: Colors.black54),
            ),
          ],
        ),
      ),
    );
  }
}
