# File

This document explains how file objects function in the Notion API, detailing the types of file sources available—Notion-hosted files, files uploaded via API, and external files—and provides guidance on selecting the appropriate type for integration.

Files, images, and other media bring Notion pages to life — from rich visuals in image blocks to downloadable attachments in databases, or branded page icons and covers.

This guide introduces how file objects work in the Notion API, the different types of file sources you can work with, and how to choose the right type for your integration.

You’ll learn about:

- Files uploaded manually in the Notion UI — returned as Notion-hosted file objects (type: `file`)
- Files uploaded via API — created using the File Upload API (type: `file_upload`)
- External files — linked via a public URL (type: `external`)

## What is a file object?

In the Notion API, any media asset is represented as a file object. A file object stores metadata about the file and indicates where and how the file is hosted.

Each file object has a required type field that determines the structure of its contents:

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "0-0": "`type`",
    "0-1": "`string` (enum)",
    "0-2": "The type of the file object.  Possible type values are:  `\"file\"`, `\"file_upload\"`, `\"external\"`.",
    "1-0": "`file`\\|`file_upload`  \\| `external`",
    "1-1": "`object`",
    "1-2": "An object containing type-specific configuration.  \n  \nRefer to the type sections below for details on type-specific values."
  },
  "cols": 3,
  "rows": 2,
  "align": [
    "left",
    "left",
    "left"
  ]
}
[/block]


Here’s what each type looks like:

```Text javascript
// Notion-hosted file (uploaded via UI)
{
  "type": "file",
  "file": {
    "url": "<https://s3.us-west-2.amazonaws.com/...">,
    "expiry_time": "2025-04-24T22:49:22.765Z"
  }
}

// File uploaded via the Notion API
{
  "type": "file_upload",
  "file_upload": {
    "id": "43833259-72ae-404e-8441-b6577f3159b4"
  }
}

// External file
{
  "type": "external",
  "external": {
    "url": "<https://example.com/image.png">
  }
}
```

### Notion-hosted files (type: `file`)

These are files that users upload manually through the Notion app — such as dragging an image into a page, adding a PDF block, or setting a page cover.

**When to use:**

- You're working with existing content in a Notion workspace
- You’re accessing files that users manually added via drag-and-drop or upload

**Tips**

- Each time you fetch a Notion-hosted file, it includes a temporary public url valid for 1 hour.
- Don’t cache or statically reference these URLs. To refresh access, re-fetch the file object.

**These corresponding file objects contain the following fields:**

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`url`",
    "0-1": "`string`",
    "0-2": "An authenticated HTTP GET URL to the file.  \n  \nThe URL is valid for one hour. If the link expires, send an API request to get an updated URL.",
    "0-3": "`\"https://s3.us-west-2.amazonaws.com/secure.notion-static.com/9bc6c6e0-32b8-4d55-8c12-3ae931f43a01/brocolli.jpeg?...\"`",
    "1-0": "`expiry_time`",
    "1-1": "`string` ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date time)",
    "1-2": "The date and time when the link expires.",
    "1-3": "`\"2020-03-17T19:10:04.968Z\"`"
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


**Example snippet**:

```Text json
{
  "type": "file",
  "file": {
    "url": "<https://s3.us-west-2.amazonaws.com/...">,
    "expiry_time": "2025-04-24T22:49:22.765Z"
  }
}
```

<br />

### Files uploaded in the API (type: `file_upload`)

These are files uploaded using the File Upload API. You first create a [File Upload](ref:file-upload), send file content, and then reference it by ID to attach it.

**When to use:**

1. You want to programmatically upload files to Notion
2. You’re building automations or file-rich integrations

**Tips**

- Once uploaded, you can reuse the File Upload ID to attach the same file to multiple pages or blocks
- To learn more about file uploads, view the [Working with files and media](doc:working-with-files-and-media) guide

**These corresponding file objects contain the following fields:**

| Field | Type | Description                                                                       | Example Value                            |
| :---- | :--- | :-------------------------------------------------------------------------------- | :--------------------------------------- |
| `id`  | UUID | ID of a [File Upload](ref:file-upload) object that has a `status` of `"uploaded"` | `"43833259-72ae-404e-8441-b6577f3159b4"` |

**Example snippet**:

```Text json
{
  "type": "file_upload",
  "file_upload": {
    "id": "43833259-72ae-404e-8441-b6577f3159b4"
  }
}
```

## External files (type: `external`)

Use this approach if you have already hosted your files elsewhere (e.g., S3, Dropbox, CDN) and want Notion to link to them.

**When to use:**

- You have an existing CDN or media server
- You have stable, permanent URLs
- Your files are publicly accessible and don’t require authentication
- You don’t want to upload files into Notion

**How to use:**

- Pass an HTTPS URL when creating or updating file-supporting blocks or properties.
- These links never expire and will always be returned as-is in API responses.

**These corresponding file objects contain the following fields:**

| Field | Type     | Description                              | Example value                            |
| :---- | :------- | :--------------------------------------- | :--------------------------------------- |
| `url` | `string` | A link to the externally hosted content. | `"https://website.domain/files/doc.txt"` |

**Example snippet**:

```Text json
{
  "type": "external",
  "external": {
    "url": "<https://example.com/photo.png">
  }
}
```

---

# File Upload

The File Upload object tracks the lifecycle of a file uploaded to Notion in the API.

> 📘 Getting started
>
> View [Working with files and media](doc:working-with-files-and-media) for a comprehensive, end-to-end guide to uploading and attaching files.

Once a file upload has a `status` of `"uploaded"`, pass its ID in a [file object](ref:file-object#files-uploaded-in-the-api-type-file_upload) with a `type` of `file_upload` to the API to attach it to blocks, pages, and databases in a Notion workspace.

## Object properties

The response of File Upload APIs like [Retrieve a file upload](ref:retrieve-a-file-upload) contains `FileUpload` objects with the following fields:

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "0-0": "`object`",
    "0-1": "`\"file_upload\"`",
    "0-2": "",
    "1-0": "`id`",
    "1-1": "UUID",
    "1-2": "ID of the FileUpload.",
    "2-0": "`created_time`",
    "2-1": "String",
    "2-2": "ISO 8601 timestamp when the FileUpload was created.",
    "3-0": "`last_edited_time`",
    "3-1": "String",
    "3-2": "ISO 8601 timestamp when the FileUpload was last modified.",
    "4-0": "`expiry_time`",
    "4-1": "String",
    "4-2": "Nullable. ISO 8601 timestamp when the FileUpload will expire, if the API integration that created it doesn't complete the upload and attach to at least one block or other object in a workspace.",
    "5-0": "`status`",
    "5-1": "One of:  \n  \n- `\"pending\"`\n- `\"uploaded\"`\n- `\"expired\"`\n- `\"failed\"`",
    "5-2": "Enum status of the file upload.  \n  \n`pending` status means awaiting upload or completion of an upload.  \n  \n`uploaded` status means file contents have been sent. If the `expiry_time` is `null`, that means the file upload has already been attached to a block or other object.  \n  \n`expired` and `failed` file uploads can no longer be used. `failed` is only used for FileUploads with `mode=external_url` when the import was unsuccessful.",
    "6-0": "`filename`",
    "6-1": "String",
    "6-2": "Nullable. Name of the file, provided during the [Create a file upload](ref:create-a-file-upload) step, or, for `single_part` uploads, can be determined from the provided filename in the form data passed to the [Send a file upload](ref:send-a-file-upload) step.  \n  \nA file extension is automatically added based on the `content_type` if the filename doesn't already have one.",
    "7-0": "`content_type`",
    "7-1": "String",
    "7-2": "Nullable. The MIME content type of the uploaded file. Must be provided explicitly or inferred from a `filename` that includes an extension.  \n  \nFor `single_part` uploads, the content type can remain `null` until the [Send a file upload](ref:send-a-file-upload) step and inferred from the `file` parameter's content type.",
    "8-0": "`content_length`",
    "8-1": "Integer",
    "8-2": "Nullable. The total size of the file, in bytes. For pending `multi_part` uploads, this field is a running total based on the file segments uploaded so far and recalculated at the end during the [Complete a file upload](ref:complete-a-file-upload) step.",
    "9-0": "`upload_url`",
    "9-1": "String",
    "9-2": "Field only included for `pending` file uploads.  \nThis is the URL to use for [sending file contents](ref:send-a-file-upload).",
    "10-0": "`complete_url`",
    "10-1": "String",
    "10-2": "Field only included for `pending` file uploads created with a `mode` of `multi_part`.  \nThis is the URL to use to [complete a multi-part file upload](ref:complete-a-file-upload).",
    "11-0": "`file_import_result`",
    "11-1": "String",
    "11-2": "Field only included for a `failed` or `uploaded` file upload created with a `mode` of `external_url`.  \nProvides details on the success or failure of importing a file into Notion using an external URL."
  },
  "cols": 3,
  "rows": 12,
  "align": [
    "left",
    "left",
    "left"
  ]
}
[/block]

---
