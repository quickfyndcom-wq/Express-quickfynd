import 'package:flutter/material.dart';
import '../api.dart';

class SettlementScreen extends StatefulWidget {
  const SettlementScreen({super.key, required this.api});

  final RiderApi api;

  @override
  State<SettlementScreen> createState() => _SettlementScreenState();
}

class _SettlementScreenState extends State<SettlementScreen> {
  Map<String, dynamic>? _data;
  final _cash = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final res = await widget.api.settlement();
    setState(() => _data = res);
    final cash = res['settlement']?['cashCollected'];
    if (cash != null) _cash.text = cash.toString();
  }

  Future<void> _submit() async {
    await widget.api.submitSettlement(num.tryParse(_cash.text) ?? 0);
    await _load();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Settlement submitted')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = _data?['settlement'] as Map<String, dynamic>?;

    return Scaffold(
      appBar: AppBar(title: const Text('Daily Settlement')),
      body: _data == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text('Date: ${s?['date']}'),
                Text('Delivered: ${s?['totalDelivered']}'),
                Text('Failed: ${s?['totalFailed']}'),
                Text('COD total: ₹${s?['totalCod']}'),
                Text('Cash collected: ₹${s?['cashCollected']}'),
                Text('Status: ${s?['status']}'),
                const SizedBox(height: 16),
                TextField(
                  controller: _cash,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Cash handed to hub',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _submit,
                  child: const Text('Submit settlement'),
                ),
              ],
            ),
    );
  }
}
