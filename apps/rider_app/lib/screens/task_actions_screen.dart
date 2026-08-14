import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api.dart';

class TaskActionsScreen extends StatefulWidget {
  const TaskActionsScreen({
    super.key,
    required this.api,
    required this.taskId,
    required this.awb,
    required this.isDelivery,
    required this.title,
    this.codAmount = 0,
  });

  final RiderApi api;
  final String taskId;
  final String awb;
  final bool isDelivery;
  final String title;
  final num codAmount;

  @override
  State<TaskActionsScreen> createState() => _TaskActionsScreenState();
}

class _TaskActionsScreenState extends State<TaskActionsScreen> {
  final _otpCtrl = TextEditingController();
  String? _message;
  bool _otpVerified = false;

  Future<void> _call() async {
    final res = await widget.api.customer(widget.taskId);
    final tel = res['customer']?['telUrl']?.toString();
    if (tel != null) {
      await launchUrl(Uri.parse(tel));
    }
  }

  Future<void> _nav() async {
    final res = await widget.api.navigation(widget.taskId);
    final url = res['navigation']?['mapsUrl']?.toString();
    if (url != null) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _sendOtp() async {
    final res = await widget.api.sendOtp(widget.taskId);
    setState(() {
      _message = res['demoOtp'] != null
          ? 'OTP sent. Demo OTP: ${res['demoOtp']}'
          : res['message']?.toString();
    });
  }

  Future<void> _verifyOtp() async {
    final res = await widget.api.verifyOtp(widget.taskId, _otpCtrl.text.trim());
    setState(() {
      _otpVerified = res['verified'] == true;
      _message = _otpVerified ? 'OTP verified' : res['error']?.toString();
    });
  }

  Future<void> _pod() async {
    final res = await widget.api.submitPod(
      taskId: widget.taskId,
      photoUrl: 'demo://photo/${widget.awb}',
      signatureUrl: 'demo://sign/${widget.awb}',
      otpVerified: _otpVerified,
    );
    setState(() => _message = res['ok'] == true ? 'POD saved · delivered' : res['error']?.toString());
  }

  Future<void> _cod() async {
    final res = await widget.api.collectCod(
      taskId: widget.taskId,
      amount: widget.codAmount,
      method: 'cash',
    );
    setState(() => _message = res['ok'] == true ? 'COD collected ₹${widget.codAmount}' : res['error']?.toString());
  }

  Future<void> _fail() async {
    final res = await widget.api.failDelivery(
      taskId: widget.taskId,
      reason: 'Customer unavailable',
      notes: 'Tried calling twice',
    );
    setState(() => _message = res['ok'] == true ? 'Failed delivery reported' : res['error']?.toString());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('AWB ${widget.awb}', style: Theme.of(context).textTheme.titleMedium),
          if (_message != null) ...[
            const SizedBox(height: 8),
            Text(_message!, style: const TextStyle(color: Colors.black54)),
          ],
          const SizedBox(height: 16),
          FilledButton.tonalIcon(
            onPressed: _call,
            icon: const Icon(Icons.call),
            label: const Text('Customer call'),
          ),
          const SizedBox(height: 8),
          FilledButton.tonalIcon(
            onPressed: _nav,
            icon: const Icon(Icons.navigation),
            label: const Text('Navigation'),
          ),
          if (widget.isDelivery) ...[
            const Divider(height: 32),
            const Text('OTP verification'),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _otpCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(hintText: 'Enter OTP'),
                  ),
                ),
                TextButton(onPressed: _sendOtp, child: const Text('Send')),
                TextButton(onPressed: _verifyOtp, child: const Text('Verify')),
              ],
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _pod,
              child: const Text('Photo & signature proof'),
            ),
            if (widget.codAmount > 0) ...[
              const SizedBox(height: 8),
              FilledButton(
                onPressed: _cod,
                child: Text('Collect COD ₹${widget.codAmount}'),
              ),
            ],
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: _fail,
              child: const Text('Failed delivery report'),
            ),
          ],
        ],
      ),
    );
  }
}
