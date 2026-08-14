import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api.dart';
import 'task_actions_screen.dart';

class DeliveriesScreen extends StatefulWidget {
  const DeliveriesScreen({super.key, required this.api});

  final RiderApi api;

  @override
  State<DeliveriesScreen> createState() => _DeliveriesScreenState();
}

class _DeliveriesScreenState extends State<DeliveriesScreen> {
  List<dynamic> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final res = await widget.api.deliveries();
    setState(() {
      _items = (res['deliveries'] as List?) ?? [];
      _loading = false;
    });
  }

  Future<void> _navigate(String id) async {
    final res = await widget.api.navigation(id);
    final url = res['navigation']?['mapsUrl']?.toString();
    if (url != null) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Assigned Deliveries')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                itemCount: _items.length,
                itemBuilder: (_, i) {
                  final d = _items[i] as Map<String, dynamic>;
                  final cod = d['codAmount'] as num? ?? 0;
                  return ListTile(
                    title: Text(d['customerName']?.toString() ?? ''),
                    subtitle: Text(
                      '${d['awb']}\n${d['address']}${cod > 0 ? '\nCOD ₹$cod' : ''}',
                    ),
                    isThreeLine: true,
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(d['status']?.toString() ?? ''),
                        IconButton(
                          icon: const Icon(Icons.navigation_outlined),
                          onPressed: () => _navigate(d['id'] as String),
                        ),
                      ],
                    ),
                    onTap: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => TaskActionsScreen(
                            api: widget.api,
                            taskId: d['id'] as String,
                            awb: d['awb'] as String,
                            isDelivery: true,
                            title: d['customerName'] as String,
                            codAmount: cod,
                          ),
                        ),
                      );
                      _load();
                    },
                  );
                },
              ),
            ),
    );
  }
}
