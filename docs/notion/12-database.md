# Database

Database objects describe the property schema of a database in Notion. Pages are the items (or children) in a database. Page property values must conform to the property objects laid out in the parent database object. All databases 📘 Properties marked with an are available to integrations with any ...

Database objects describe the property schema of a database in Notion. [Pages](ref:page) are the items (or children) in a database. [Page property values](ref:page#property-value-object) must conform to the [property objects](https://developers.notion.com/reference/property-object) laid out in the parent database object.

## All databases

> 📘
>
> Properties marked with an \* are available to integrations with any capabilities. Other properties require read content capabilities in order to be returned from the Notion API. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`object`\\*",
    "0-1": "`string`",
    "0-2": "Always `\"database\"`.",
    "0-3": "`\"database\"`",
    "1-0": "`id`\\*",
    "1-1": "`string` (UUID)",
    "1-2": "Unique identifier for the database.",
    "1-3": "`\"2f26ee68-df30-4251-aad4-8ddc420cba3d\"`",
    "2-0": "`created_time`",
    "2-1": "`string` ([ISO 8601 date and time](https://en.wikipedia.org/wiki/ISO_8601))",
    "2-2": "Date and time when this database was created. Formatted as an [ISO 8601 date time](https://en.wikipedia.org/wiki/ISO_8601) string.",
    "2-3": "`\"2020-03-17T19:10:04.968Z\"`",
    "3-0": "`created_by`",
    "3-1": "[Partial User](ref:user)",
    "3-2": "User who created the database.",
    "3-3": "`{\"object\": \"user\",\"id\": \"45ee8d13-687b-47ce-a5ca-6e2e45548c4b\"}`",
    "4-0": "`last_edited_time`",
    "4-1": "`string` ([ISO 8601 date and time](https://en.wikipedia.org/wiki/ISO_8601))",
    "4-2": "Date and time when this database was updated. Formatted as an [ISO 8601 date time](https://en.wikipedia.org/wiki/ISO_8601) string.",
    "4-3": "`\"2020-03-17T21:49:37.913Z\"`",
    "5-0": "`last_edited_by`",
    "5-1": "[Partial User](ref:user)",
    "5-2": "User who last edited the database.",
    "5-3": "`{\"object\": \"user\",\"id\": \"45ee8d13-687b-47ce-a5ca-6e2e45548c4b\"}`",
    "6-0": "`title`",
    "6-1": "array of [rich text objects](ref:rich-text)",
    "6-2": "Name of the database as it appears in Notion.  \nSee [rich text object](ref:rich-text)) for a breakdown of the properties.",
    "6-3": "`\"title\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Can I create a URL property\",\n                \"link\": null\n            },\n            \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n            },\n            \"plain_text\": \"Can I create a URL property\",\n            \"href\": null\n        }\n    ]`",
    "7-0": "`description`",
    "7-1": "array of [rich text objects](ref:rich-text)",
    "7-2": "Description of the database as it appears in Notion.  \nSee [rich text object](ref:rich-text)) for a breakdown of the properties.",
    "7-3": "",
    "8-0": "`icon`",
    "8-1": "[File Object](ref:file-object) or [Emoji object](ref:emoji-object)",
    "8-2": "Page icon.",
    "8-3": "",
    "9-0": "`cover`",
    "9-1": "[File object](ref:file-object) ",
    "9-2": "Page cover image.",
    "9-3": "",
    "10-0": "`properties`\\*",
    "10-1": "`object`",
    "10-2": "Schema of properties for the database as they appear in Notion.  \n  \n`key` string  \nThe name of the property as it appears in Notion.  \n  \n`value` object  \nA [Property object](https://developers.notion.com/reference/property-object).",
    "10-3": "",
    "11-0": "`parent`",
    "11-1": "`object`",
    "11-2": "Information about the database's parent. See [Parent object](ref:parent-object).",
    "11-3": "`{ \"type\": \"page_id\", \"page_id\": \"af5f89b5-a8ff-4c56-a5e8-69797d11b9f8\" }`",
    "12-0": "`url`",
    "12-1": "`string`",
    "12-2": "The URL of the Notion database.",
    "12-3": "`\"https://www.notion.so/668d797c76fa49349b05ad288df2d136\"`",
    "13-0": "`archived`",
    "13-1": "`boolean`",
    "13-2": "The archived status of the  database.",
    "13-3": "`false`",
    "14-0": "`in_trash`",
    "14-1": "`boolean`",
    "14-2": "Whether the database has been deleted.",
    "14-3": "`false`",
    "15-0": "`is_inline`",
    "15-1": "`boolean`",
    "15-2": "Has the value `true` if the database appears in the page as an inline block. Otherwise has the value `false` if the database appears as a child page.",
    "15-3": "`false`",
    "16-0": "`public_url`",
    "16-1": "`string`",
    "16-2": "The public page URL if the page has been published to the web. Otherwise, `null`.",
    "16-3": "`\"https://jm-testing.notion.site/p1-6df2c07bfc6b4c46815ad205d132e22d\"1`"
  },
  "cols": 4,
  "rows": 17,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


> 🚧 Maximum schema size recommendation
>
> Notion recommends a maximum schema size of **50KB**. Updates to database schemas that are too large will be blocked to help maintain database performance.

---
