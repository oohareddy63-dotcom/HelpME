// To parse this JSON data, do
//
//     final closeContacts = closeContactsFromJson(jsonString);

import 'package:meta/meta.dart';
import 'dart:convert';

CloseContacts closeContactsFromJson(String str) =>
    CloseContacts.fromJson(json.decode(str));

String closeContactsToJson(CloseContacts data) => json.encode(data.toJson());

class CloseContacts {
  CloseContacts({
    @required this.success,
    @required this.contacts,
  });

  final bool success;
  final Map<String, int> contacts;

  factory CloseContacts.fromJson(Map<String, dynamic> json) => CloseContacts(
        success: json["success"] == null ? null : json["success"],
        contacts: json["contacts"] == null
            ? null
            : Map<String, int>.from(json["contacts"]),
      );

  Map<String, dynamic> toJson() => {
        "success": success == null ? null : success,
        "contacts": contacts == null
            ? null
            : Map<String, dynamic>.from(contacts),
      };
}
