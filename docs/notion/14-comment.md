# Comment

The Comment object represents a comment on a Notion page or block. Comments can be viewed or created by an integration that has access to the page/block and the correct capabilities. Please see the Capabilities guide for more information on setting up your integration's capabilities. When retrieving...

The Comment object represents a comment on a Notion page or block. Comments can be viewed or created by an integration that has access to the page/block and the correct capabilities. Please see the [Capabilities guide](ref:capabilities) for more information on setting up your integration's capabilities.

When [retrieving comments](ref:retrieve-a-comment), one or more Comment objects will be returned in the form of an array, sorted in ascending chronological order. When [adding a comment](ref:create-a-comment) to a page or discussion, the Comment object just added will always be returned.

```json
{
  "object": "comment",
  "id": "7a793800-3e55-4d5e-8009-2261de026179",
  "parent": {
    "type": "page_id",
    "page_id": "5c6a2821-6bb1-4a7e-b6e1-c50111515c3d"
  },
  "discussion_id": "f4be6752-a539-4da2-a8a9-c3953e13bc0b",
  "created_time": "2022-07-15T21:17:00.000Z",
  "last_edited_time": "2022-07-15T21:17:00.000Z",
  "created_by": {
    "object": "user",
    "id": "e450a39e-9051-4d36-bc4e-8581611fc592"
  },
  "rich_text": [
    {
      "type": "text",
      "text": {
        "content": "Hello world",
        "link": null
      },
      "annotations": {
        "bold": false,
        "italic": false,
        "strikethrough": false,
        "underline": false,
        "code": false,
        "color": "default"
      },
      "plain_text": "Hello world",
      "href": null
    }
  ],
  "attachments": [
    {
      "category": "image",
      "file": {
        "url": "https://s3.us-west-2.amazonaws.com/...",
        "expiry_time": "2025-06-10T21:58:51.599Z"
      }
    }
  ]
}
```

## All comments

> 📘 Reminder: Turn on integration comment capabilities
>
> Integrations must have read comments or insert comments capabilities in order to interact with the Comment object through the API.
> For more information on integration capabilities, see the [capabilities guide](https://developers.notion.com/reference/capabilities).

| Property           | Type                                                                        | Description                                                                                                                                                                                                    | Example value                                                                                                                                                                                                                                                                    |
| :----------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `object`           | `string`                                                                    | Always `"comment"`                                                                                                                                                                                             | `"comment"`                                                                                                                                                                                                                                                                      |
| `id`               | `string` (UUIDv4)                                                           | Unique identifier of the comment.                                                                                                                                                                              | `"ce18f8c6-ef2a-427f-b416-43531fc7c117"`                                                                                                                                                                                                                                         |
| `parent`           | `object`                                                                    | Information about the comment's parent. See [Parent object](ref:parent-object). Note that comments may only be parented by pages or blocks.                                                                    | `{         "type": "block_id",         "block_id": "5d4ca33c-d6b7-4675-93d9-84b70af45d1c"     }`                                                                                                                                                                                 |
| `discussion_id`    | `string` (UUIDv4)                                                           | Unique identifier of the discussion thread that the comment is associated with. See [the guide](doc:working-with-comments#listing-comments-for-a-page-or-block) for more information about discussion threads. | `"ce18f8c6-ef2a-427f-b416-43531fc7c117"`                                                                                                                                                                                                                                         |
| `created_time`     | `string` ([ISO 8601 date and time](https://en.wikipedia.org/wiki/ISO_8601)) | Date and time when this comment was created. Formatted as an [ISO 8601 date time](https://en.wikipedia.org/wiki/ISO_8601) string.                                                                              | `"2022-07-15T21:46:00.000Z"`                                                                                                                                                                                                                                                     |
| `last_edited_time` | `string` ([ISO 8601 date and time](https://en.wikipedia.org/wiki/ISO_8601)) | Date and time when this comment was updated. Formatted as an [ISO 8601 date time](https://en.wikipedia.org/wiki/ISO_8601) string.                                                                              | `"2022-07-15T21:46:00.000Z"`                                                                                                                                                                                                                                                     |
| `created_by`       | [Partial User](ref:user)                                                    | User who created the comment.                                                                                                                                                                                  | `{         "object": "user",         "id": "e450a39e-9051-4d36-bc4e-8581611fc592"     }`                                                                                                                                                                                         |
| `rich_text`        | [Rich text object](ref:rich-text)                                           | Content of the comment, which supports rich text formatting, links, and mentions.                                                                                                                              | `[         {             "text": {                 "content": "Kale",                 "link": {                     "type": "url",                     "url": "https://www.healthline.com/nutrition/10-proven-benefits-of-kale"                 }             }         }     ]` |
| `attachments`      | [Comment Attachment](ref:rich-text-copy)                                    | File attachments on the comment                                                                                                                                                                                | `[      {        "category": "image",        "file": {          "url": "https://s3.us-west-2.amazonaws.com/9bc6c6e0-32b8-4d55-8c12-3ae931f43a01/meow...",          "expiry_time": "2025-06-10T21:58:51.599Z"        }      }    ]`                                               |

---

# Comment attachment

The document describes the Comment Attachment object, which allows up to three files to be attached to a comment in the Notion app, detailing the request and response formats for creating comments with attachments via the API.

The Comment Attachment object represents [files](ref:file-object) that have been attached to a [Comment](ref:comment-object).

> 📘
>
> Comments can currently support up to 3 attachments.

## Request format (input)

### Object properties

After following the [Working with files and media](doc:working-with-files-and-media) guide, provide an array of objects under the `attachments` parameter in the [Create comment](ref:create-a-comment) API, each containing the following properties:

[block:parameters]
{
  "data": {
    "h-0": "Parameter",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`file_upload_id`",
    "0-1": "`string` (UUID)",
    "0-2": "ID of a [File Upload](ref:file-upload) with a status of `\"uploaded\"`",
    "0-3": "`\"2e2cdb8b-9897-4a6c-a935-82922b1cfb87\"`",
    "1-0": "`type`",
    "1-1": "`string`  \n(optional)",
    "1-2": "Possible type values are:`\"file_upload\"`",
    "1-3": "`\"file_upload\"`"
  },
  "cols": 4,
  "rows": 2,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


Example Create Comment request:

```json API request
{
  "parent": {
    "page_id": "d0a1ffaf-a4d8-4acf-a1ed-abae6e110418"
  },
  "rich_text": [
    {
      "text": {"content": "Thanks for the helpful page!"}
    },
  ],
  "attachments": {
    "file_upload_id": "2e2cdb8b-9897-4a6c-a935-82922b1cfb87"
  }
}
```

In the Notion app, when viewing a comment uploaded using the API, the user experience is automatically customized based on the detected category of the file upload. For example, uploading a `.png` file displays your attachment as an inline image instead of a regular file download block.

## Response format (output)

### Object properties

The response of Comment APIs like [Create comment](ref:create-a-comment) contains `attachments` with the following fields:

| Field      | Type            | Description                                                                                                                                 | Example value                                                                                          |
| :--------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------- |
| `category` | `string` (enum) | The category of this attachment. Possible type values are: `"audio"`, `"image"`, `"pdf"`, `"productivity"`, and `"video"`                   | `"audio"`                                                                                              |
| `file`     | `object`        | A [file object](https://developers.notion.com/reference/file-object#notion-hosted-files-type-file)  containing type-specific configuration. | `{"url": "<https://s3.us-west-2.amazonaws.com/...">,       "expiry_time": "2025-06-10T21:26:03.070Z"}` |

Example attachment object in Create Comment response:

```json Comment Attachment Response
{
  "category": "video",
  "file": {
    "url": "https://s3.us-west-2.amazonaws.com/...",
    "expiry_time": "2025-06-10T21:26:03.070Z"
  }
}
```

The `file.url` is a temporary download link generated at the time of retrieving a comment. See the guide on [Retrieving existing files](doc:retrieving-files) to learn more about accessing the files you upload.

---
