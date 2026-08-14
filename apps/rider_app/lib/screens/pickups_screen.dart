import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api.dart';
import 'task_actions_screen.dart';

class PickupsScreen extends StatefulWidget {
  const PickupsScreen({super.key, required this.api});

  final RiderApi api;

  @override
  State<PickupsScreen> createState() => _PickupsScreenState();
}

class _PickupsScreenState extends State<PickupsScreen> {
  List<dynamic> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final res = await widget.api.pickups();
    setState(() {
      _items = (res['pickups'] as List?) ?? [];
      _loading = false;
    });
  }

  Future<void> _navigate(String id) async {
    final res = await widget.api.navigation(id);
    final url = res['navigation']?['mapsUrl']?.toString();
    if (url != null) await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Assigned Pickups')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                itemCount: _items.length,
                itemBuilder: (_, i) {
                  final p = _items[i] as Map<String, dynamic>;
                  return ListTile(
                    title: Text(p['merchantName']?.toString() ?? ''),
                    subtitle: Text('${p['awb']}\n${p['address']}'),
                    isThreeLine: true,
                    trailing: Text(p['status']?.toString() ?? ''),
                    onTap: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => TaskActionsScreen(
                            api: widget.api,
                            taskId: p['id'] as String,
                            awb: p['awb'] as String,
                            isDelivery: false,
                            title: p['merchantName'] as String,
                          ),
                        ),
                      );
                      _load();
                    },
                    onLongPress: () => _navigate(p['id'] as String),
                  );
                },
              ),
            ),
    );
  }
}
