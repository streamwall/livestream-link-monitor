# Emoji

An emoji object contains information about an emoji character. It is most often used to represent an emoji that is rendered as a page icon in the Notion UI. { "type": "emoji", "emoji": "😻" } The object contains the following fields: Type Description Example value type "emoji" The constant string "e...

An emoji object contains information about an emoji character. It is most often used to represent an emoji that is rendered as a page icon in the Notion UI.

```json Example emoji object
{
  "type": "emoji",
  "emoji": "😻"
}
```

The object contains the following fields:

|         | Type      | Description                                                    | Example value |
| :------ | :-------- | :------------------------------------------------------------- | :------------ |
| `type`  | `"emoji"` | The constant string `"emoji"` that represents the object type. | `"emoji"`     |
| `emoji` | `string`  | The emoji character.                                           | `"😻"`        |

To use the Notion API to render an emoji object as a page icon, set a page’s icon [property field](https://developers.notion.com/reference/page) to an emoji object.

### Example: set a page icon via the [Create a page](https://developers.notion.com/reference/post-page) endpoint

```curl
curl 'https://api.notion.com/v1/pages' \
  -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  --data '{
  "parent": {
    "page_id": "13d6da822f9343fa8ec14c89b8184d5a"
  },
  "properties": {
    "title": [
      {
        "type": "text",
        "text": {
          "content": "A page with an avocado icon",
          "link": null
        }
      }
    ]
  },
  "icon": {
    "type": "emoji",
    "emoji": "🥑"
  }
}'
```

### Example: set a page icon via the [Update page](https://developers.notion.com/reference/patch-page) endpoint

```curl
curl https://api.notion.com/v1/pages/60bdc8bd-3880-44b8-a9cd-8a145b3ffbd7 \
  -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -X PATCH \
	--data '{
  "icon": {
	  "type": "emoji",
	  "emoji": "🥨"
    }
}'
```

## Custom emoji

Custom emojis are icons uploaded and managed in your own workspace.

The object contains the following fields:

|                | Type             | Description                                                    | Example value                                                                                                                                                                                                           |
| :------------- | :--------------- | :------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`         | `"custom_emoji"` | The constant string `"emoji"` that represents the object type. | `"emoji"`                                                                                                                                                                                                               |
| `custom_emoji` | `object`         | Custom emoji object, containing id, name, url                  | `{       "id": "45ce454c-d427-4f53-9489-e5d0f3d1db6b",       "name": "bufo",       "url": "https://s3-us-west-2.amazonaws.com/public.notion-static.com/865e85fc-7442-44d3-b323-9b03a2111720/3c6796979c50f4aa.png"    }` |

### Example: custom emoji in page icon response:

```json Example emoji object
{
  "icon": {
    "type": "custom_emoji",
    "custom_emoji": {
      "id": "45ce454c-d427-4f53-9489-e5d0f3d1db6b",
      "name": "bufo",
      "url": "https://s3-us-west-2.amazonaws.com/public.notion-static.com/865e85fc-7442-44d3-b323-9b03a2111720/3c6796979c50f4aa.png"
    }
  }
}
```

### Example: inline custom emoji response

```json Example emoji object
{
  "type": "mention",
  "mention": {
    "type": "custom_emoji",
    "custom_emoji": {
      "id": "45ce454c-d427-4f53-9489-e5d0f3d1db6b",
      "name": "bufo",
      "url": "https://s3-us-west-2.amazonaws.com/public.notion-static.com/865e85fc-7442-44d3-b323-9b03a2111720/3c6796979c50f4aa.png"
    }
  }
  ...
}
```

### Example: set page icon to a custom emoji

Provide the custom emoji ID to preserve/set custom emoji

```curl
curl https://api.notion.com/v1/pages/60bdc8bd-3880-44b8-a9cd-8a145b3ffbd7 \
  -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -X PATCH \
  --data '{
  "icon": {
    "type": "custom_emoji",
    "custom_emoji": {
      "id": "45ce454c-d427-4f53-9489-e5d0f3d1db6b"
    }
  }
}'
```

---

# Unfurl attribute (Link Previews)

A Link Preview is created from an array of unfurl attribute objects.

A [Link Preview](https://developers.notion.com/docs/link-previews) is a real-time excerpt of authenticated content that unfurls in Notion when an authenticated user shares an enabled link. Developers can build Link Preview integrations to customize how links for domains they own look when the links unfurl in a Notion workspace. The display of the Link Preview is customizable in terms of content and layout.

> 👍 Learn how to build your own Link Preview integration
>
> - [Introduction to Link Preview integrations](https://developers.notion.com/docs/link-previews) guide
> - [Build a Link Preview integration](https://developers.notion.com/docs/build-a-link-preview-integration) guide
> - [Help Centre](https://www.notion.so/help/guides/notion-api-link-previews-feature) guide

Link Previews can be displayed in their full format, or they can be shown as a "Mention".

Let's first look at an example of a full-format Link Preview:

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/a034247-link_preview.png",
        "link_preview.png",
        1242
      ],
      "align": "center",
      "caption": "Example Link Preview in a Notion workspace"
    }
  ]
}
[/block]

Here is the same link again but now as a Mention — a miniature version of a Link Preview that uses the same data.

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/f588a6f-mention.png",
        "mention.png",
        1060
      ],
      "align": "center",
      "caption": "Example Mention in a Notion workspace"
    }
  ]
}
[/block]

A Link Preview or Mention displays data that is sent to Notion as an array of unfurl attribute objects. There are a number of optional attributes developers cannot. However, **every array must contain a `title` attribute and a `dev` attribute.**

Using the same Link Preview and Mention we saw above, let's look at the array of unfurl attribute objects that would render these previews. The following payload creates the example Link Preview and Mention above:

```json
[
  {
    "id": "title",
    "name": "Title",
    "type": "inline",
    "inline": {
      "title": {
        "value": "Feature Request: Link Previews",
        "section": "title"
      }
    }
  },
  {
    "id": "dev",
    "name": "Developer Name",
    "type": "inline",
    "inline": {
      "plain_text": {
        "value": "Acme Inc",
        "section": "secondary"
      }
    }
  },
  {
    "id": "state",
    "name": "State",
    "type": "relation",
    "relation": {
      "uri": "acme:item_state/open",
      "mention": {
        "section": "primary"
      }
    }
  },
  {
    "id": "itemId",
    "name": "Item Id",
    "type": "inline",
    "inline": {
      "plain_text": {
        "value": "#23487",
        "section": "identifier"
      }
    }
  },
  {
    "id": "itemIcon",
    "name": "Item Icon",
    "type": "inline",
    "inline": {
      "color": {
        "value": {
          "r": 247,
          "g": 247,
          "b": 42
        },
        "section": "entity"
      }
    }
  },
  {
    "id": "description",
    "name": "Description",
    "type": "inline",
    "inline": {
      "plain_text": {
        "value": "Would love to be able to preview some Acme resources in Notion!\n Maybe an open item?",
        "section": "body"
      }
    }
  },
  {
    "id": "updated_at",
    "name": "Updated At",
    "type": "inline",
    "inline": {
      "datetime": {
        "value": "2022-01-11T19:53:18.829Z",
        "section": "secondary"
      }
    }
  },
  {
    "id": "label",
    "name": "Label",
    "type": "inline",
    "inline": {
      "enum": {
        "value": "🔨 Ready to Build",
        "color": {
          "r": 100,
          "g": 100,
          "b": 100
        },
        "section": "primary"
      }
    }
  },
  {
    "id": "media",
    "name": "Embed",
    "embed": {
      "src_url": "https://c.tenor.com/XgaU95K_XiwAAAAC/kermit-typing.gif",
      "image": {
        "section": "embed"
      }
    }
  }
]
```

Each unfurl attribute object in this array maps to a different customizable section of a Link Preview. (To learn more about each section, jump to [The `section` value](https://developers.notion.com/reference/unfurl-attribute-object#the-section-value).

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/3d6f5ec-Untitled_1.png",
        null,
        "Anatomy of a Link Preview in Notion"
      ],
      "align": "center",
      "caption": "Anatomy of a Link Preview in Notion"
    }
  ]
}
[/block]

First, let's let at the properties in each individual unfurl attribute object.

## The unfurl attribute object

```json Example unfurl attribute object
{
    "id": "title",
    "name": "Title",
    "type": "inline",
    "inline": {
      "title": {
        "value": "Feature Request: Link Previews",
        "section": "title"
      }
    }
  }
```

Each unfurl attribute object contains the following values:

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`id`",
    "0-1": "`string`",
    "0-2": "A unique identifier for the attribute.  \n  \nIf more than one attribute with the same `id` is provided, then the latter attribute overrides the value of the first.",
    "0-3": "`\"title\"`",
    "1-0": "`name`",
    "1-1": "`string`",
    "1-2": "A human readable name describing the attribute.",
    "1-3": "`\"Title\"`",
    "2-0": "`type`",
    "2-1": "`inline` \\|\\| `embed`",
    "2-2": "The type of attribute.  \n  \nMost attributes are `inline`. Use `embed` for rich media sub-types like `image`, `video`, or `audio`.",
    "2-3": "`\"inline\"`",
    "3-0": "`inline` \\|\\| `embed`",
    "3-1": "`object`",
    "3-2": "An object whose key is a sub-type. The child sub-type object includes the `value` to display and the `section` of the Link Preview where the data is rendered.",
    "3-3": "`{\n    \"title\": {\n      \"value\": \"Feature Request: Link Previews\",\n      \"section\": \"title\"\n      }\n}`"
  },
  "cols": 4,
  "rows": 4,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]

### Inline sub-type objects

The key of inline sub-type objects represents the kind of sub-type. The values of the key are the `value` to display and the `section` of the Link Preview where the value is rendered.

[block:parameters]
{
  "data": {
    "h-0": "Sub-type",
    "h-1": "Description",
    "h-2": "Example value",
    "0-0": "`color`",
    "0-1": "A color with r, b, g values.",
    "0-2": "`{\n  \"value\": {\n    \"r\": 247,\n    \"g\": 247,\n    \"b\": 42\n  },\n  \"section\": \"entity\"\n}`",
    "1-0": "`date`",
    "1-1": "A date.",
    "1-2": "`{\n  \"value\": \"2022-01-11\",\n  \"section\": \"secondary\"\n}`",
    "2-0": "`datetime`",
    "2-1": "A datetime.",
    "2-2": "`{\n  \"value\": \"2022-01-11T19:53:18.829Z\",\n  \"section\": \"secondary\"\n}`",
    "3-0": "`enum`",
    "3-1": "A string value and optional color object.",
    "3-2": "`{\n  \"value\": \"🔨 Ready to Build\",\n  \"color\": {\n    \"r\": 100,\n    \"g\": 100,\n    \"b\": 100\n  },\n  \"section\": \"primary\"\n}`",
    "4-0": "`plain_text`",
    "4-1": "Any plain text content.",
    "4-2": "`{\n  \"value\": \"Would love to be able to preview some Acme resources in Notion!\\n Maybe an open item?\",\n  \"section\": \"body\"\n}`",
    "5-0": "`title`\\*",
    "5-1": "The title of the Link Preview.  \n  \n\\*An unfurl attribute object of this type must be included in every payload to create a Link Preview.",
    "5-2": "`{\n  \"value\": \"Feature Request: Link Previews\",\n  \"section\": \"title\"\n}`"
  },
  "cols": 3,
  "rows": 6,
  "align": [
    "left",
    "left",
    "left"
  ]
}
[/block]

#### The `dev` attribute

Every array of attribute objects that is sent to Notion to create a Link Preview must also include a `dev` attribute. The attribute indicates the developer or company who created the Link Preview. It takes the following format:

```json Example dev attribute
{
    "id": "dev",
    "name": "Developer Name",
    "type": "inline",
    "inline": {
      "plain_text": {
        "value": "Acme Inc",
        "section": "secondary"
     }
   }
 }
```

### Embed sub-type child objects

You can use the `embed` sub-type object to add rich content like JPGs, GIFs, or iFrames to your Link Preview.

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/d482801-embed.png",
        "embed.png",
        1228
      ],
      "align": "center",
      "caption": "An example Link Preview that embeds an image of Kermit the Frog"
    }
  ]
}
[/block]

All embed sub-type objects contain: a `src_url` field that is a link to the embed, and an object whose key is the sub-type of the embed and whose value is an object indicating the `section` of the Link Preview where the value is rendered.

| Sub-type | Description                                           | Example value                                                                                             |
| :------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `audio`  | Audio from a source URL.                              | `{   "src_url": "https://s3.us-east-3.amazonaws.com/12345.mp4",   "audio": {   "section": "embed"   } }`  |
| `html`   | HTML from a source URL that is rendered in an iFrame. | `{   "src_url": "https://s3.us-east-3.amazonaws.com/12345.html",   "html": {   "section": "embed"   } }`  |
| `image`  | Image from a source URL.                              | `{   "src_url": "https://s3.us-east-3.amazonaws.com/12345.png",   "image": {   "section": "avatar"   } }` |
| `video`  | Video from a source URL.                              | `{   "src_url": "https://s3.us-east-3.amazonaws.com/12345.mp4",   "video": {   "section": "embed"   } }`  |

> 📘
>
> There’s no need to ask a user to log in to your service in an iFrame embed. If they’re using a Link Preview, then they’ve already authenticated.

### The `section` value

The `section` value of an unfurl attribute object defines where an attribute is rendered in the Link Preview or Mention.

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/121dcba-sections_lp.png",
        "sections_lp.png",
        1378
      ],
      "align": "center",
      "caption": "The sections of a Link Preview"
    }
  ]
}
[/block]

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/1de6886-sections_mention.png",
        "sections_mention.png",
        926
      ],
      "align": "center",
      "caption": "The sections of a Mention"
    }
  ]
}
[/block]

A `section` is specified in the sub-type object for the attribute. Refer to the table below for details about each `section` and its valid parent sub-types.

[block:parameters]
{
  "data": {
    "h-0": "Section",
    "h-1": "Description",
    "h-2": "Valid parent sub-types",
    "0-0": "avatar",
    "0-1": "The picture found on the bottom left of a Link Preview.",
    "0-2": "`image`, `plain_text`",
    "1-0": "background",
    "1-1": "A background color for the Link Preview.",
    "1-2": "`color`",
    "2-0": "body",
    "2-1": "The main string content of a Link Preview.",
    "2-2": "`plain_text`",
    "3-0": "embed",
    "3-1": "The large space where the content of an `embed` attribute type is displayed in a Link Preview.",
    "3-2": "`audio`, `html`, `image`, `pdf`, `video`",
    "4-0": "entity",
    "4-1": "The small picture found in the subheading of a Link Preview and in a Mention.",
    "4-2": "`color`, `image`",
    "5-0": "identifier",
    "5-1": "The subheading found on the bottom of a Link Preview and on the left side of a Mention.",
    "5-2": "`image`, `plain_text`",
    "6-0": "primary",
    "6-1": "The first subheading section.",
    "6-2": "`enum`, `date`, `datetime`, `plain_text`",
    "7-0": "secondary",
    "7-1": "The second subheading section.",
    "7-2": "`date`, `datetime`, `plain_text`",
    "8-0": "title\\*",
    "8-1": "The main heading in a Link Preview or Mention.  \n  \n\\*Required.",
    "8-2": "`title`"
  },
  "cols": 3,
  "rows": 9,
  "align": [
    "left",
    "left",
    "left"
  ]
}
[/block]

---

# Authentication

Requests use the HTTP Authorization header to both authenticate and authorize operations. The Notion API accepts bearer tokens in this header. Bearer tokens are provided to you when you create an integration. If you're creating a public OAuth integration, the integration also receives bearer tokens ...

Requests use the HTTP `Authorization` header to both authenticate and authorize operations. The Notion API accepts bearer tokens in this header. Bearer tokens are provided to you when you create an integration. If you're creating a public OAuth integration, the integration also receives bearer tokens each time a user completes the OAuth flow.

```curl
curl 'https://api.notion.com/v1/users' \
  -H 'Authorization: Bearer '"$NOTION_ACCESS_TOKEN"'' \
  -H "Notion-Version: 2022-06-28"
```

Inside Notion, users will see updates made by integrations attributed to a bot. The bot's name and avatar are controlled in the integration settings.

Using a [Notion SDK](https://notionapi.readme.io/reference/intro#code-samples--sdks), a bearer token can be passed once to initialize a `Client` and the client can be used to send multiple authenticated requests.

```javascript Notion SDK for JS
const { Client } = require('@notionhq/client');

const client = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });
```



Learn more in the [Authorization guide](doc:authorization) .

---

# Create a token

Creates an access token that a third-party service can use to authenticate with Notion.

> 📘
>
> For step-by-step instructions on how to use this endpoint to create a public integration, check out the [Authorization guide](https://developers.notion.com/docs/authorization#set-up-the-auth-flow-for-a-public-integration). To walkthrough how to create tokens for Link Previews, refer to the [Link Previews guide](https://developers.notion.com/docs/build-a-link-preview-integration).

> 🚧 Redirect URI requirements for public integrations
>
> The `redirect_uri` is a _required_ field in the request body for this endpoint if:
>
> - the `redirect_uri` query parameter was set in the [Authorization URL](https://developers.notion.com/docs/authorization#step-1-navigate-the-user-to-the-integrations-authorization-url) provided to users, _or_;
> - there are more than one `redirect_uri`s included in the [integration’s settings](https://www.notion.so/my-integrations) under **OAuth Domain & URIs**.
>
> In most cases, the `redirect_uri` field is required.
>
> This field is not allowed in the request body if:
>
> - there is one `redirect_uri` included in the [integration’s settings](https://www.notion.so/my-integrations) under **OAuth Domain & URIs**, _and_ the `redirect_uri` query parameter was not included in the Authorization URL.
>
> Learn more in the public integration section of the [Authorization Guide](https://developers.notion.com/docs/authorization#public-integration-auth-flow-set-up).

_Note: Each Public API endpoint can return several possible error codes. To see a full description of each type of error code, see the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/oauth/token": {
      "post": {
        "summary": "Create a token",
        "description": "Creates an access token that a third-party service can use to authenticate with Notion.",
        "operationId": "create-a-token",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "schema": {
              "type": "string",
              "default": "Basic $BASE64_ENCODED_ID_AND_SECRET"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "code",
                  "grant_type",
                  "redirect_uri"
                ],
                "properties": {
                  "code": {
                    "type": "string",
                    "description": "A unique random code that Notion generates to authenticate with your service, generated when a user initiates the OAuth flow."
                  },
                  "grant_type": {
                    "type": "string",
                    "description": "A constant string: \"authorization_code\".",
                    "default": "\"authorization_code\""
                  },
                  "redirect_uri": {
                    "type": "string",
                    "description": "The `\"redirect_uri\"` that was provided in the OAuth Domain & URI section of the integration's Authorization settings. Do not include this field if a `\"redirect_uri\"` query param was not included in the Authorization URL provided to users. In most cases, this field is required."
                  },
                  "external_account": {
                    "type": "object",
                    "description": "Required if and only when building [Link Preview](https://developers.notion.com/docs/link-previews) integrations (otherwise ignored). An object with `key` and `name` properties. `key` should be a unique identifier for the account. Notion uses the `key` to determine whether or not the user is re-connecting the same account. `name` should be some way for the user to know which account they used to authenticate with your service. If a user has authenticated Notion with your integration before and `key` is the same but `name` is different, then Notion updates the `name` associated with your integration.",
                    "properties": {}
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"access_token\": \"e202e8c9-0990-40af-855f-ff8f872b1ec6c\",\n  \"bot_id\": \"b3414d659-1224-5ty7-6ffr-cc9d8773drt601288f\",\n  \"duplicated_template_id\": null,\n  \"owner\": {\n    \"workspace\": true\n  },\n  \"workspace_icon\": \"https://website.domain/images/image.png\",\n  \"workspace_id\": \"j565j4d7x3-2882-61bs-564a-jj9d9ui-c36hxfr7x\",\n  \"workspace_name\": \"Ada's Notion Workspace\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "access_token": {
                      "type": "string",
                      "example": "e202e8c9-0990-40af-855f-ff8f872b1ec6c"
                    },
                    "bot_id": {
                      "type": "string",
                      "example": "b3414d659-1224-5ty7-6ffr-cc9d8773drt601288f"
                    },
                    "duplicated_template_id": {},
                    "owner": {
                      "type": "object",
                      "properties": {
                        "workspace": {
                          "type": "boolean",
                          "example": true,
                          "default": true
                        }
                      }
                    },
                    "workspace_icon": {
                      "type": "string",
                      "example": "https://website.domain/images/image.png"
                    },
                    "workspace_id": {
                      "type": "string",
                      "example": "j565j4d7x3-2882-61bs-564a-jj9d9ui-c36hxfr7x"
                    },
                    "workspace_name": {
                      "type": "string",
                      "example": "Ada's Notion Workspace"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"error\": \"invalid_request\",\n    \"error_description\": \"body failed validation: body.redirect_uri should be defined, instead was `undefined`.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "invalid_request"
                    },
                    "error_description": {
                      "type": "string",
                      "example": "body failed validation: body.redirect_uri should be defined, instead was `undefined`."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "curl",
              "code": "curl --location --request POST 'https://api.notion.com/v1/oauth/token' \\\n--header 'Authorization: Basic '\"$BASE64_ENCODED_ID_AND_SECRET\"'' \\\n--header 'Content-Type: application/json' \\\n--header 'Notion-Version: 2022-06-28' \\\n--data '{\n  \"grant_type\": \"authorization_code\",\n  \"code\": \"e202e8c9-0990-40af-855f-ff8f872b1ec6\",\n  \"redirect_uri\": \"https://wwww.my-integration-endpoint.dev/callback\",\n   \"external_account\": {\n        \"key\": \"A83823453409384\",\n        \"name\": \"Notion - team@makenotion.com\"\n    }\n}'",
              "name": "Create a token for a Link Preview"
            },
            {
              "language": "curl",
              "code": "curl --location --request POST 'https://api.notion.com/v1/oauth/token' \\\n--header 'Authorization: Basic '\"$BASE64_ENCODED_ID_AND_SECRET\"'' \\\n--header 'Content-Type: application/json' \\\n--header 'Notion-Version: 2022-06-28' \\\n--data '{\n\t\"grant_type\": \"authorization_code\",\n  \"code\": \"e202e8c9-0990-40af-855f-ff8f872b1ec6\",\n  \"redirect_uri\": \"https://example.com/auth/notion/callback\"\n}'",
              "name": "Create a token for a public integration"
            }
          ],
          "samples-languages": [
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:63c0b606d6e97900106eb9f3"
}
```

---

# Introspect token

Get a token's active status, scope, and issued time.


# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/oauth/introspect": {
      "post": {
        "summary": "Introspect token",
        "description": "Get a token's active status, scope, and issued time.",
        "operationId": "introspect-token",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "schema": {
              "type": "string",
              "default": "Basic $BASE64_ENCODED_ID_AND_SECRET"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "token"
                ],
                "properties": {
                  "token": {
                    "type": "string",
                    "description": "The access token"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"active\": true,\n  \"scope\": \"read_content insert_content update_content\",\n  \"iat\": 1727554061083  \n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "active": {
                      "type": "boolean",
                      "example": true,
                      "default": true
                    },
                    "scope": {
                      "type": "string",
                      "example": "read_content insert_content update_content"
                    },
                    "iat": {
                      "type": "integer",
                      "example": 1727554061083,
                      "default": 0
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "curl",
              "code": "curl --location --request POST 'https://api.notion.com/v1/oauth/introspect' \\\n--header 'Authorization: Basic '\"$BASE64_ENCODED_ID_AND_SECRET\"'' \\\n--header 'Content-Type: application/json' \\\n--data '{\n  \"token\": \"'$ACCESS_TOKEN'\"\n}'"
            }
          ],
          "samples-languages": [
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:66f86270c642090043a010b4"
}
```

---

# Revoke token

Revoke an access token.


# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/oauth/revoke": {
      "post": {
        "summary": "Revoke token",
        "description": "Revoke an access token.",
        "operationId": "revoke-token",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "schema": {
              "type": "string",
              "default": "Basic $BASE64_ENCODED_ID_AND_SECRET"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "token"
                ],
                "properties": {
                  "token": {
                    "type": "string",
                    "description": "Revoke an access token"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": ""
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "curl",
              "code": "curl --location --request POST 'https://api.notion.com/v1/oauth/revoke' \\\n--header 'Authorization: Basic '\"$BASE64_ENCODED_ID_AND_SECRET\"'' \\\n--header 'Content-Type: application/json' \\\n--data '{\n\t\"token\": \"'$ACCESS_TOKEN'\"\n}"
            }
          ],
          "samples-languages": [
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:66f86535ec7aa9000fbc129e"
}
```

---

# Append block children

Creates and appends new children blocks to the parent block_id specified. Blocks can be parented by other blocks, pages, or databases. Returns a paginated list of newly created first level children block objects . Existing blocks cannot be moved using this endpoint. Blocks are appended to the bottom...

Creates and appends new children blocks to the parent `block_id` specified. Blocks can be parented by other blocks, pages, or databases.

Returns a paginated list of newly created first level children [block objects](ref:block).

Existing blocks cannot be moved using this endpoint. Blocks are appended to the bottom of the parent block. To append a block in a specific place other than the bottom of the parent block, use the `"after"` parameter and set its value to the ID of the block that the new block should be appended after. Once a block is appended as a child, it can't be moved elsewhere via the API.

For blocks that allow children, we allow up to **two** levels of nesting in a single request.

There is a limit of **100 block children** that can be appended by a single API request. Arrays of block children longer than 100 will result in an error.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have insert content capabilities. Attempting to call this API without insert content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

### Errors

Returns a 404 HTTP response if the block specified by `id` doesn't exist, or if the integration doesn't have access to the block.

Returns a 400 or 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. To see a full description of each type of error code, see the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/blocks/{block_id}/children": {
      "patch": {
        "summary": "Append block children",
        "description": "",
        "operationId": "patch-block-children",
        "parameters": [
          {
            "name": "block_id",
            "in": "path",
            "description": "Identifier for a [block](ref:block). Also accepts a [page](ref:page) ID.",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "children"
                ],
                "properties": {
                  "children": {
                    "type": "array",
                    "description": "Child content to append to a container block as an array of [block objects](ref:block)"
                  },
                  "after": {
                    "type": "string",
                    "description": "The ID of the existing block that the new block should be appended after."
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"list\",\n\t\"results\": [\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"id\": \"c02fc1d3-db8b-45c5-a222-27595b15aea7\",\n\t\t\t\"parent\": {\n\t\t\t\t\"type\": \"page_id\",\n\t\t\t\t\"page_id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\"\n\t\t\t},\n\t\t\t\"created_time\": \"2022-03-01T19:05:00.000Z\",\n\t\t\t\"last_edited_time\": \"2022-07-06T19:41:00.000Z\",\n\t\t\t\"created_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t\t\t},\n\t\t\t\"last_edited_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t\t\t},\n\t\t\t\"has_children\": false,\n\t\t\t\"archived\": false,\n\t\t\t\"type\": \"heading_2\",\n\t\t\t\"heading_2\": {\n\t\t\t\t\"rich_text\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"text\",\n\t\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\t\"content\": \"Lacinato kale\",\n\t\t\t\t\t\t\t\"link\": null\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"annotations\": {\n\t\t\t\t\t\t\t\"bold\": false,\n\t\t\t\t\t\t\t\"italic\": false,\n\t\t\t\t\t\t\t\"strikethrough\": false,\n\t\t\t\t\t\t\t\"underline\": false,\n\t\t\t\t\t\t\t\"code\": false,\n\t\t\t\t\t\t\t\"color\": \"default\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"plain_text\": \"Lacinato kale\",\n\t\t\t\t\t\t\"href\": null\n\t\t\t\t\t}\n\t\t\t\t],\n\t\t\t\t\"color\": \"default\",\n        \"is_toggleable\": false\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"id\": \"acc7eb06-05cd-4603-a384-5e1e4f1f4e72\",\n\t\t\t\"parent\": {\n\t\t\t\t\"type\": \"page_id\",\n\t\t\t\t\"page_id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\"\n\t\t\t},\n\t\t\t\"created_time\": \"2022-03-01T19:05:00.000Z\",\n\t\t\t\"last_edited_time\": \"2022-07-06T19:51:00.000Z\",\n\t\t\t\"created_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t\t\t},\n\t\t\t\"last_edited_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"0c3e9826-b8f7-4f73-927d-2caaf86f1103\"\n\t\t\t},\n\t\t\t\"has_children\": false,\n\t\t\t\"archived\": false,\n\t\t\t\"type\": \"paragraph\",\n\t\t\t\"paragraph\": {\n\t\t\t\t\"rich_text\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"text\",\n\t\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\t\"content\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n\t\t\t\t\t\t\t\"link\": {\n\t\t\t\t\t\t\t\t\"url\": \"https://en.wikipedia.org/wiki/Lacinato_kale\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"annotations\": {\n\t\t\t\t\t\t\t\"bold\": false,\n\t\t\t\t\t\t\t\"italic\": false,\n\t\t\t\t\t\t\t\"strikethrough\": false,\n\t\t\t\t\t\t\t\"underline\": false,\n\t\t\t\t\t\t\t\"code\": false,\n\t\t\t\t\t\t\t\"color\": \"default\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"plain_text\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n\t\t\t\t\t\t\"href\": \"https://en.wikipedia.org/wiki/Lacinato_kale\"\n\t\t\t\t\t}\n\t\t\t\t],\n\t\t\t\t\"color\": \"default\"\n\t\t\t}\n\t\t}\n\t],\n\t\"next_cursor\": null,\n\t\"has_more\": false,\n\t\"type\": \"block\",\n\t\"block\": {}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "list"
                    },
                    "results": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "object": {
                            "type": "string",
                            "example": "block"
                          },
                          "id": {
                            "type": "string",
                            "example": "c02fc1d3-db8b-45c5-a222-27595b15aea7"
                          },
                          "parent": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "page_id"
                              },
                              "page_id": {
                                "type": "string",
                                "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                              }
                            }
                          },
                          "created_time": {
                            "type": "string",
                            "example": "2022-03-01T19:05:00.000Z"
                          },
                          "last_edited_time": {
                            "type": "string",
                            "example": "2022-07-06T19:41:00.000Z"
                          },
                          "created_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                              }
                            }
                          },
                          "last_edited_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                              }
                            }
                          },
                          "has_children": {
                            "type": "boolean",
                            "example": false,
                            "default": true
                          },
                          "archived": {
                            "type": "boolean",
                            "example": false,
                            "default": true
                          },
                          "type": {
                            "type": "string",
                            "example": "heading_2"
                          },
                          "heading_2": {
                            "type": "object",
                            "properties": {
                              "rich_text": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "type": {
                                      "type": "string",
                                      "example": "text"
                                    },
                                    "text": {
                                      "type": "object",
                                      "properties": {
                                        "content": {
                                          "type": "string",
                                          "example": "Lacinato kale"
                                        },
                                        "link": {}
                                      }
                                    },
                                    "annotations": {
                                      "type": "object",
                                      "properties": {
                                        "bold": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "italic": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "strikethrough": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "underline": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "code": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "color": {
                                          "type": "string",
                                          "example": "default"
                                        }
                                      }
                                    },
                                    "plain_text": {
                                      "type": "string",
                                      "example": "Lacinato kale"
                                    },
                                    "href": {}
                                  }
                                }
                              },
                              "color": {
                                "type": "string",
                                "example": "default"
                              },
                              "is_toggleable": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              }
                            }
                          }
                        }
                      }
                    },
                    "next_cursor": {},
                    "has_more": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "block"
                    },
                    "block": {
                      "type": "object",
                      "properties": {}
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const blockId = 'b55c9c91-384d-452b-81db-d1ef79372b75';\n  const response = await notion.blocks.children.append({\n    block_id: blockId,\n    children: [\n      {\n        \"heading_2\": {\n          \"rich_text\": [\n            {\n              \"text\": {\n                \"content\": \"Lacinato kale\"\n              }\n            }\n          ]\n        }\n      },\n      {\n        \"paragraph\": {\n          \"rich_text\": [\n            {\n              \"text\": {\n                \"content\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n                \"link\": {\n                  \"url\": \"https://en.wikipedia.org/wiki/Lacinato_kale\"\n                }\n              }\n            }\n          ]\n        }\n      }\n    ],\n  });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl -X PATCH 'https://api.notion.com/v1/blocks/b55c9c91-384d-452b-81db-d1ef79372b75/children' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Notion-Version: 2022-06-28\" \\\n  --data '{\n\t\"children\": [\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"type\": \"heading_2\",\n\t\t\t\"heading_2\": {\n\t\t\t\t\"rich_text\": [{ \"type\": \"text\", \"text\": { \"content\": \"Lacinato kale\" } }]\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"type\": \"paragraph\",\n\t\t\t\"paragraph\": {\n\t\t\t\t\"rich_text\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"text\",\n\t\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\t\"content\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n\t\t\t\t\t\t\t\"link\": { \"url\": \"https://en.wikipedia.org/wiki/Lacinato_kale\" }\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t]\n\t\t\t}\n\t\t}\n\t]\n}'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:6108afa394cfa9001041ef33"
}
```

---

# Retrieve a block

Retrieves a Block object using the ID specified. If the block returned contains the key has_children: true , use the Retrieve block children endpoint to get the list of children. To retrieve page content for a specific page, use Retrieve block children and set the page ID as the block_id . For more ...

Retrieves a [Block object](ref:block) using the ID specified.

If the block returned contains the key `has_children: true`, use the [Retrieve block children](https://developers.notion.com/reference/get-block-children) endpoint to get the list of children.

To retrieve page content for a specific page, use [Retrieve block children](https://developers.notion.com/reference/get-block-children) and set the page ID as the `block_id`.

For more information, read the [Working with page content guide](https://developers.notion.com/docs/working-with-page-content#modeling-content-as-blocks).

> 📘 Integration capabilities
>
> This endpoint requires an integration to have read content capabilities. Attempting to call this API without read content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

### Errors

Returns a 404 HTTP response if the block doesn't exist, or if the integration doesn't have access to the block.

Returns a 400 or 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/blocks/{block_id}": {
      "get": {
        "summary": "Retrieve a block",
        "description": "",
        "operationId": "retrieve-a-block",
        "parameters": [
          {
            "name": "block_id",
            "in": "path",
            "description": "Identifier for a Notion block",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"block\",\n\t\"id\": \"c02fc1d3-db8b-45c5-a222-27595b15aea7\",\n\t\"parent\": {\n\t\t\"type\": \"page_id\",\n\t\t\"page_id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\"\n\t},\n\t\"created_time\": \"2022-03-01T19:05:00.000Z\",\n\t\"last_edited_time\": \"2022-03-01T19:05:00.000Z\",\n\t\"created_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t},\n\t\"last_edited_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t},\n\t\"has_children\": false,\n\t\"archived\": false,\n\t\"type\": \"heading_2\",\n\t\"heading_2\": {\n\t\t\"rich_text\": [\n\t\t\t{\n\t\t\t\t\"type\": \"text\",\n\t\t\t\t\"text\": {\n\t\t\t\t\t\"content\": \"Lacinato kale\",\n\t\t\t\t\t\"link\": null\n\t\t\t\t},\n\t\t\t\t\"annotations\": {\n\t\t\t\t\t\"bold\": false,\n\t\t\t\t\t\"italic\": false,\n\t\t\t\t\t\"strikethrough\": false,\n\t\t\t\t\t\"underline\": false,\n\t\t\t\t\t\"code\": false,\n\t\t\t\t\t\"color\": \"default\"\n\t\t\t\t},\n\t\t\t\t\"plain_text\": \"Lacinato kale\",\n\t\t\t\t\"href\": null\n\t\t\t}\n\t\t],\n\t\t\"color\": \"default\",\n    \"is_toggleable\": false\n\t}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "block"
                    },
                    "id": {
                      "type": "string",
                      "example": "c02fc1d3-db8b-45c5-a222-27595b15aea7"
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "page_id"
                        },
                        "page_id": {
                          "type": "string",
                          "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                        }
                      }
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-03-01T19:05:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-03-01T19:05:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "last_edited_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "has_children": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "archived": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "heading_2"
                    },
                    "heading_2": {
                      "type": "object",
                      "properties": {
                        "rich_text": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "text"
                              },
                              "text": {
                                "type": "object",
                                "properties": {
                                  "content": {
                                    "type": "string",
                                    "example": "Lacinato kale"
                                  },
                                  "link": {}
                                }
                              },
                              "annotations": {
                                "type": "object",
                                "properties": {
                                  "bold": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "italic": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "strikethrough": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "underline": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "code": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "color": {
                                    "type": "string",
                                    "example": "default"
                                  }
                                }
                              },
                              "plain_text": {
                                "type": "string",
                                "example": "Lacinato kale"
                              },
                              "href": {}
                            }
                          }
                        },
                        "color": {
                          "type": "string",
                          "example": "default"
                        },
                        "is_toggleable": {
                          "type": "boolean",
                          "example": false,
                          "default": true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const blockId = 'c02fc1d3-db8b-45c5-a222-27595b15aea7';\n  const response = await notion.blocks.retrieve({\n    block_id: blockId,\n  });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/blocks/0c940186-ab70-4351-bb34-2d16f0635d49' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H 'Notion-Version: 2022-06-28'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:6108af2ab4cfb1004f0b82b3"
}
```

---

# Retrieve block children

Returns a paginated array of child block objects contained in the block using the ID specified. In order to receive a complete representation of a block, you may need to recursively retrieve the block children of child blocks. 👍 Page content is represented by block children. See the Working with pa...

Returns a paginated array of child [block objects](ref:block) contained in the block using the ID specified. In order to receive a complete representation of a block, you may need to recursively retrieve the block children of child blocks.

> 👍
>
> Page content is represented by block children. See the [Working with page content guide](https://developers.notion.com/docs/working-with-page-content#modeling-content-as-blocks) for more information.

Returns only the first level of children for the specified block. See [block objects](ref:block) for more detail on determining if that block has nested children.

The response may contain fewer than `page_size` of results.

See [Pagination](https://developers.notion.com/reference/intro#pagination) for details about how to use a cursor to iterate through the list.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have read content capabilities. Attempting to call this API without read content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

### Errors

Returns a 404 HTTP response if the block specified by `id` doesn't exist, or if the integration doesn't have access to the block.

Returns a 400 or 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/blocks/{block_id}/children": {
      "get": {
        "summary": "Retrieve block children",
        "description": "",
        "operationId": "get-block-children",
        "parameters": [
          {
            "name": "block_id",
            "in": "path",
            "description": "Identifier for a [block](ref:block)",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "start_cursor",
            "in": "query",
            "description": "If supplied, this endpoint will return a page of results starting after the cursor provided. If not supplied, this endpoint will return the first page of results.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page_size",
            "in": "query",
            "description": "The number of items from the full list desired in the response. Maximum: 100",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 100
            }
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"list\",\n\t\"results\": [\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"id\": \"c02fc1d3-db8b-45c5-a222-27595b15aea7\",\n\t\t\t\"parent\": {\n\t\t\t\t\"type\": \"page_id\",\n\t\t\t\t\"page_id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\"\n\t\t\t},\n\t\t\t\"created_time\": \"2022-03-01T19:05:00.000Z\",\n\t\t\t\"last_edited_time\": \"2022-03-01T19:05:00.000Z\",\n\t\t\t\"created_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t\t\t},\n\t\t\t\"last_edited_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t\t\t},\n\t\t\t\"has_children\": false,\n\t\t\t\"archived\": false,\n\t\t\t\"type\": \"heading_2\",\n\t\t\t\"heading_2\": {\n\t\t\t\t\"rich_text\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"text\",\n\t\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\t\"content\": \"Lacinato kale\",\n\t\t\t\t\t\t\t\"link\": null\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"annotations\": {\n\t\t\t\t\t\t\t\"bold\": false,\n\t\t\t\t\t\t\t\"italic\": false,\n\t\t\t\t\t\t\t\"strikethrough\": false,\n\t\t\t\t\t\t\t\"underline\": false,\n\t\t\t\t\t\t\t\"code\": false,\n\t\t\t\t\t\t\t\"color\": \"default\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"plain_text\": \"Lacinato kale\",\n\t\t\t\t\t\t\"href\": null\n\t\t\t\t\t}\n\t\t\t\t],\n\t\t\t\t\"color\": \"default\",\n        \"is_toggleable\": false\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"id\": \"acc7eb06-05cd-4603-a384-5e1e4f1f4e72\",\n\t\t\t\"parent\": {\n\t\t\t\t\"type\": \"page_id\",\n\t\t\t\t\"page_id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\"\n\t\t\t},\n\t\t\t\"created_time\": \"2022-03-01T19:05:00.000Z\",\n\t\t\t\"last_edited_time\": \"2022-03-01T19:05:00.000Z\",\n\t\t\t\"created_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t\t\t},\n\t\t\t\"last_edited_by\": {\n\t\t\t\t\"object\": \"user\",\n\t\t\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t\t\t},\n\t\t\t\"has_children\": false,\n\t\t\t\"archived\": false,\n\t\t\t\"type\": \"paragraph\",\n\t\t\t\"paragraph\": {\n\t\t\t\t\"rich_text\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"text\",\n\t\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\t\"content\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n\t\t\t\t\t\t\t\"link\": {\n\t\t\t\t\t\t\t\t\"url\": \"https://en.wikipedia.org/wiki/Lacinato_kale\"\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"annotations\": {\n\t\t\t\t\t\t\t\"bold\": false,\n\t\t\t\t\t\t\t\"italic\": false,\n\t\t\t\t\t\t\t\"strikethrough\": false,\n\t\t\t\t\t\t\t\"underline\": false,\n\t\t\t\t\t\t\t\"code\": false,\n\t\t\t\t\t\t\t\"color\": \"default\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t\"plain_text\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n\t\t\t\t\t\t\"href\": \"https://en.wikipedia.org/wiki/Lacinato_kale\"\n\t\t\t\t\t}\n\t\t\t\t],\n\t\t\t\t\"color\": \"default\"\n\t\t\t}\n\t\t}\n\t],\n\t\"next_cursor\": null,\n\t\"has_more\": false,\n\t\"type\": \"block\",\n\t\"block\": {}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "list"
                    },
                    "results": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "object": {
                            "type": "string",
                            "example": "block"
                          },
                          "id": {
                            "type": "string",
                            "example": "c02fc1d3-db8b-45c5-a222-27595b15aea7"
                          },
                          "parent": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "page_id"
                              },
                              "page_id": {
                                "type": "string",
                                "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                              }
                            }
                          },
                          "created_time": {
                            "type": "string",
                            "example": "2022-03-01T19:05:00.000Z"
                          },
                          "last_edited_time": {
                            "type": "string",
                            "example": "2022-03-01T19:05:00.000Z"
                          },
                          "created_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                              }
                            }
                          },
                          "last_edited_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                              }
                            }
                          },
                          "has_children": {
                            "type": "boolean",
                            "example": false,
                            "default": true
                          },
                          "archived": {
                            "type": "boolean",
                            "example": false,
                            "default": true
                          },
                          "type": {
                            "type": "string",
                            "example": "heading_2"
                          },
                          "heading_2": {
                            "type": "object",
                            "properties": {
                              "rich_text": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "type": {
                                      "type": "string",
                                      "example": "text"
                                    },
                                    "text": {
                                      "type": "object",
                                      "properties": {
                                        "content": {
                                          "type": "string",
                                          "example": "Lacinato kale"
                                        },
                                        "link": {}
                                      }
                                    },
                                    "annotations": {
                                      "type": "object",
                                      "properties": {
                                        "bold": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "italic": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "strikethrough": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "underline": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "code": {
                                          "type": "boolean",
                                          "example": false,
                                          "default": true
                                        },
                                        "color": {
                                          "type": "string",
                                          "example": "default"
                                        }
                                      }
                                    },
                                    "plain_text": {
                                      "type": "string",
                                      "example": "Lacinato kale"
                                    },
                                    "href": {}
                                  }
                                }
                              },
                              "color": {
                                "type": "string",
                                "example": "default"
                              },
                              "is_toggleable": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              }
                            }
                          }
                        }
                      }
                    },
                    "next_cursor": {},
                    "has_more": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "block"
                    },
                    "block": {
                      "type": "object",
                      "properties": {}
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const blockId = '59833787-2cf9-4fdf-8782-e53db20768a5';\n  const response = await notion.blocks.children.list({\n    block_id: blockId,\n    page_size: 50,\n  });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/blocks/b55c9c91-384d-452b-81db-d1ef79372b75/children?page_size=100' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Notion-Version: 2022-06-28\""
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:609880270bd97b01002d7380"
}
```

---

# Update a block

Updates the content for the specified block_id based on the block type. Supported fields based on the block object type (see Block object for available fields and the expected input for each field). Note : The update replaces the entire value for a given field. If a field is omitted (ex: omitting ch...

Updates the content for the specified `block_id` based on the block type. Supported fields based on the block object type (see [Block object](ref:block#block-type-object) for available fields and the expected input for each field).

**Note**: The update replaces the _entire_ value for a given field. If a field is omitted (ex: omitting `checked` when updating a `to_do` block), the value will not be changed.

> 📘 Updating `child_page` blocks
>
> To update `child_page` type blocks, use the [Update page](ref:patch-page) endpoint. Updating the page's `title` updates the text displayed in the associated `child_page` block.

> 📘 Updating `child_database` blocks
>
> To update `child_database` type blocks, use the [Update database](ref:update-a-database) endpoint. Updating the page's `title` updates the text displayed in the associated `child_database` block.

> 📘 Updating `children`
>
> A block's children _CANNOT_ be directly updated with this endpoint. Instead use [Append block children](ref:patch-block-children) to add children.

> 📘 Updating `heading` blocks
>
> To update the toggle of a `heading` block, you can include the optional `is_toggleable` property in the request. Toggle can be added and removed from a `heading` block. However, you cannot remove toggle from a `heading` block if it has children. All children _MUST_ be removed before revoking toggle from a `heading` block.

### Success

Returns a 200 HTTP response containing the updated [block object](ref:block) on success.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have update content capabilities. Attempting to call this API without update content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

### Errors

Returns a 404 HTTP response if the block doesn't exist, has been archived, or if the integration doesn't have access to the page.

Returns a 400 if the `type` for the block is incorrect or the input is incorrect for a given field.

Returns a 400 or a 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/blocks/{block_id}": {
      "patch": {
        "summary": "Update a block",
        "description": "",
        "operationId": "update-a-block",
        "parameters": [
          {
            "name": "block_id",
            "in": "path",
            "description": "Identifier for a Notion block",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "{type}": {
                    "type": "object",
                    "description": "The [block object `type`](ref:block#block-object-keys) value with the properties to be updated. Currently only `text` (for supported block types) and `checked` (for `to_do` blocks) fields can be updated.",
                    "properties": {}
                  },
                  "archived": {
                    "type": "boolean",
                    "description": "Set to true to archive (delete) a block. Set to false to un-archive (restore) a block.",
                    "default": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"block\",\n\t\"id\": \"c02fc1d3-db8b-45c5-a222-27595b15aea7\",\n\t\"parent\": {\n\t\t\"type\": \"page_id\",\n\t\t\"page_id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\"\n\t},\n\t\"created_time\": \"2022-03-01T19:05:00.000Z\",\n\t\"last_edited_time\": \"2022-07-06T19:41:00.000Z\",\n\t\"created_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t},\n\t\"last_edited_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t},\n\t\"has_children\": false,\n\t\"archived\": false,\n\t\"type\": \"heading_2\",\n\t\"heading_2\": {\n\t\t\"rich_text\": [\n\t\t\t{\n\t\t\t\t\"type\": \"text\",\n\t\t\t\t\"text\": {\n\t\t\t\t\t\"content\": \"Lacinato kale\",\n\t\t\t\t\t\"link\": null\n\t\t\t\t},\n\t\t\t\t\"annotations\": {\n\t\t\t\t\t\"bold\": false,\n\t\t\t\t\t\"italic\": false,\n\t\t\t\t\t\"strikethrough\": false,\n\t\t\t\t\t\"underline\": false,\n\t\t\t\t\t\"code\": false,\n\t\t\t\t\t\"color\": \"green\"\n\t\t\t\t},\n\t\t\t\t\"plain_text\": \"Lacinato kale\",\n\t\t\t\t\"href\": null\n\t\t\t}\n\t\t],\n\t\t\"color\": \"default\",\n    \"is_toggleable\": false\n\t}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "block"
                    },
                    "id": {
                      "type": "string",
                      "example": "c02fc1d3-db8b-45c5-a222-27595b15aea7"
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "page_id"
                        },
                        "page_id": {
                          "type": "string",
                          "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                        }
                      }
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-03-01T19:05:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-07-06T19:41:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "last_edited_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "has_children": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "archived": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "heading_2"
                    },
                    "heading_2": {
                      "type": "object",
                      "properties": {
                        "rich_text": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "text"
                              },
                              "text": {
                                "type": "object",
                                "properties": {
                                  "content": {
                                    "type": "string",
                                    "example": "Lacinato kale"
                                  },
                                  "link": {}
                                }
                              },
                              "annotations": {
                                "type": "object",
                                "properties": {
                                  "bold": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "italic": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "strikethrough": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "underline": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "code": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  },
                                  "color": {
                                    "type": "string",
                                    "example": "green"
                                  }
                                }
                              },
                              "plain_text": {
                                "type": "string",
                                "example": "Lacinato kale"
                              },
                              "href": {}
                            }
                          }
                        },
                        "color": {
                          "type": "string",
                          "example": "default"
                        },
                        "is_toggleable": {
                          "type": "boolean",
                          "example": false,
                          "default": true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const blockId = '9bc30ad4-9373-46a5-84ab-0a7845ee52e6';\n  const response = await notion.blocks.update({\n\t\"block_id\": blockId,\n\t\"heading_2\": {\n\t\t\"rich_text\": [\n\t\t\t{\n\t\t\t\t\"text\": {\n\t\t\t\t\t\"content\": \"Lacinato kale\"\n\t\t\t\t},\n\t\t\t\t\"annotations\": {\n\t\t\t\t\t\"color\": \"green\"\n\t\t\t\t}\n\t\t\t}\n\t\t]\n\t}\n});\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl https://api.notion.com/v1/blocks/9bc30ad4-9373-46a5-84ab-0a7845ee52e6 \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Notion-Version: 2022-06-28\" \\\n  -X PATCH \\\n  --data '{\n  \"to_do\": {\n    \"rich_text\": [{ \n      \"text\": { \"content\": \"Lacinato kale\" } \n      }],\n    \"checked\": false\n  }\n}'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:611ff9e1545410001802a284"
}
```

---

# Delete a block

Sets a Block object , including page blocks, to archived: true using the ID specified. Note: in the Notion UI application, this moves the block to the "Trash" where it can still be accessed and restored. To restore the block with the API, use the Update a block or Update page respectively. 📘 Integr...

Sets a [Block object](ref:block), including page blocks, to `archived: true` using the ID specified. Note: in the Notion UI application, this moves the block to the "Trash" where it can still be accessed and restored.

To restore the block with the API, use the [Update a block](ref:update-a-block) or [Update page](ref:patch-page) respectively.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have update content capabilities. Attempting to call this API without update content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

### Errors

Returns a 404 HTTP response if the block doesn't exist, or if the integration doesn't have access to the block.

Returns a 400 or 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/blocks/{block_id}": {
      "delete": {
        "summary": "Delete a block",
        "description": "",
        "operationId": "delete-a-block",
        "parameters": [
          {
            "name": "block_id",
            "in": "path",
            "description": "Identifier for a Notion block",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"block\",\n\t\"id\": \"7985540b-2e77-4ac6-8615-c3047e36f872\",\n\t\"parent\": {\n\t\t\"type\": \"page_id\",\n\t\t\"page_id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\"\n\t},\n\t\"created_time\": \"2022-07-06T19:52:00.000Z\",\n\t\"last_edited_time\": \"2022-07-06T19:52:00.000Z\",\n\t\"created_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"0c3e9826-b8f7-4f73-927d-2caaf86f1103\"\n\t},\n\t\"last_edited_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t},\n\t\"has_children\": false,\n\t\"archived\": true,\n\t\"type\": \"paragraph\",\n\t\"paragraph\": {\n\t\t\"rich_text\": [],\n\t\t\"color\": \"default\"\n\t}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "block"
                    },
                    "id": {
                      "type": "string",
                      "example": "7985540b-2e77-4ac6-8615-c3047e36f872"
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "page_id"
                        },
                        "page_id": {
                          "type": "string",
                          "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                        }
                      }
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-07-06T19:52:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-07-06T19:52:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "0c3e9826-b8f7-4f73-927d-2caaf86f1103"
                        }
                      }
                    },
                    "last_edited_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "has_children": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "archived": {
                      "type": "boolean",
                      "example": true,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "paragraph"
                    },
                    "paragraph": {
                      "type": "object",
                      "properties": {
                        "rich_text": {
                          "type": "array"
                        },
                        "color": {
                          "type": "string",
                          "example": "default"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const blockId = '7985540b-2e77-4ac6-8615-c3047e36f872';\n  const response = await notion.blocks.delete({\n    block_id: blockId,\n  });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl -X DELETE 'https://api.notion.com/v1/blocks/9bc30ad4-9373-46a5-84ab-0a7845ee52e6' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H 'Notion-Version: 2022-06-28'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:6132447016d92b006ea46315"
}
```

---

# Create a page

Creates a new page that is a child of an existing page or database. If the new page is a child of an existing page, title is the only valid property in the properties body param. If the new page is a child of an existing database, the keys of the properties object body param must match the parent da...

Creates a new page that is a child of an existing page or database.

If the new page is a child of an existing page,`title` is the only valid property in the `properties` body param.

If the new page is a child of an existing database, the keys of the `properties` object body param must match the parent [database's properties](https://developers.notion.com/reference/property-object).

This endpoint can be used to create a new page with or without content using the `children` option. To add content to a page after creating it, use the [Append block children](https://developers.notion.com/reference/patch-block-children) endpoint.

Returns a new [page object](https://developers.notion.com/reference/page).

> 🚧 Some page `properties` are not supported via the API.
>
> A request body that includes `rollup`, `created_by`, `created_time`, `last_edited_by`, or `last_edited_time` values in the properties object returns an error. These Notion-generated values cannot be created or updated via the API. If the `parent` contains any of these properties, then the new page’s corresponding values are automatically created.

> 📘 Requirements
>
> Your integration must have [Insert Content capabilities](https://developers.notion.com/reference/capabilities#content-capabilities) on the target parent page or database in order to call this endpoint. To update your integrations capabilities, navigation to the [My integrations](https://www.notion.so/my-integrations) dashboard, select your integration, go to the **Capabilities** tab, and update your settings as needed.
>
> Attempting a query without update content capabilities returns an HTTP response with a 403 status code.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/pages": {
      "post": {
        "summary": "Create a page",
        "description": "",
        "operationId": "post-page",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "parent",
                  "properties"
                ],
                "properties": {
                  "parent": {
                    "type": "string",
                    "description": "The parent page or database where the new page is inserted, represented as a JSON object with a `page_id` or `database_id` key, and the corresponding ID.",
                    "format": "json"
                  },
                  "properties": {
                    "type": "string",
                    "description": "The values of the page’s properties. If the `parent` is a database, then the schema must match the parent database’s properties. If the `parent` is a page, then the only valid object key is `title`.",
                    "format": "json"
                  },
                  "children": {
                    "type": "array",
                    "description": "The content to be rendered on the new page, represented as an array of [block objects](https://developers.notion.com/reference/block).",
                    "items": {
                      "type": "string"
                    }
                  },
                  "icon": {
                    "type": "string",
                    "description": "The icon of the new page. Either an [emoji object](https://developers.notion.com/reference/emoji-object) or an [external file object](https://developers.notion.com/reference/file-object)..",
                    "format": "json"
                  },
                  "cover": {
                    "type": "string",
                    "description": "The cover image of the new page, represented as a [file object](https://developers.notion.com/reference/file-object).",
                    "format": "json"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"page\",\n  \"id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\",\n  \"created_time\": \"2022-03-01T19:05:00.000Z\",\n  \"last_edited_time\": \"2022-07-06T19:16:00.000Z\",\n  \"created_by\": {\n    \"object\": \"user\",\n    \"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n  },\n  \"last_edited_by\": {\n    \"object\": \"user\",\n    \"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n  },\n  \"cover\": {\n    \"type\": \"external\",\n    \"external\": {\n      \"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n    }\n  },\n  \"icon\": {\n    \"type\": \"emoji\",\n    \"emoji\": \"🥬\"\n  },\n  \"parent\": {\n    \"type\": \"database_id\",\n    \"database_id\": \"d9824bdc-8445-4327-be8b-5b47500af6ce\"\n  },\n  \"archived\": false,\n  \"properties\": {\n    \"Store availability\": {\n      \"id\": \"%3AUPp\"\n    },\n    \"Food group\": {\n      \"id\": \"A%40Hk\"\n    },\n    \"Price\": {\n      \"id\": \"BJXS\"\n    },\n    \"Responsible Person\": {\n      \"id\": \"Iowm\"\n    },\n    \"Last ordered\": {\n      \"id\": \"Jsfb\"\n    },\n    \"Cost of next trip\": {\n      \"id\": \"WOd%3B\"\n    },\n    \"Recipes\": {\n      \"id\": \"YfIu\"\n    },\n    \"Description\": {\n      \"id\": \"_Tc_\"\n    },\n    \"In stock\": {\n      \"id\": \"%60%5Bq%3F\"\n    },\n    \"Number of meals\": {\n      \"id\": \"zag~\"\n    },\n    \"Photo\": {\n      \"id\": \"%7DF_L\"\n    },\n    \"Name\": {\n      \"id\": \"title\"\n    }\n  },\n  \"url\": \"https://www.notion.so/Tuscan-Kale-598337872cf94fdf8782e53db20768a5\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "page"
                    },
                    "id": {
                      "type": "string",
                      "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-03-01T19:05:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-07-06T19:16:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "last_edited_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "cover": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "external"
                        },
                        "external": {
                          "type": "object",
                          "properties": {
                            "url": {
                              "type": "string",
                              "example": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                            }
                          }
                        }
                      }
                    },
                    "icon": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "emoji"
                        },
                        "emoji": {
                          "type": "string",
                          "example": "🥬"
                        }
                      }
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "database_id"
                        },
                        "database_id": {
                          "type": "string",
                          "example": "d9824bdc-8445-4327-be8b-5b47500af6ce"
                        }
                      }
                    },
                    "archived": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "properties": {
                      "type": "object",
                      "properties": {
                        "Store availability": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%3AUPp"
                            }
                          }
                        },
                        "Food group": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "A%40Hk"
                            }
                          }
                        },
                        "Price": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "BJXS"
                            }
                          }
                        },
                        "Responsible Person": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Iowm"
                            }
                          }
                        },
                        "Last ordered": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Jsfb"
                            }
                          }
                        },
                        "Cost of next trip": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "WOd%3B"
                            }
                          }
                        },
                        "Recipes": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "YfIu"
                            }
                          }
                        },
                        "Description": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "_Tc_"
                            }
                          }
                        },
                        "In stock": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%60%5Bq%3F"
                            }
                          }
                        },
                        "Number of meals": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "zag~"
                            }
                          }
                        },
                        "Photo": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%7DF_L"
                            }
                          }
                        },
                        "Name": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "title"
                            }
                          }
                        }
                      }
                    },
                    "url": {
                      "type": "string",
                      "example": "https://www.notion.so/Tuscan-Kale-598337872cf94fdf8782e53db20768a5"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          },
          "404": {
            "description": "404",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 404,\n    \"code\": \"object_not_found\",\n    \"message\": \"Could not find page with ID: 4cc3b486-0b48-4cfe-8ce9-67c47100eb6a. Make sure the relevant pages and databases are shared with your integration.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 404,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "object_not_found"
                    },
                    "message": {
                      "type": "string",
                      "example": "Could not find page with ID: 4cc3b486-0b48-4cfe-8ce9-67c47100eb6a. Make sure the relevant pages and databases are shared with your integration."
                    }
                  }
                }
              }
            }
          },
          "429": {
            "description": "429",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"error\",\n  \"status\": 429,\n  \"code\": \"rate_limited\",\n  \"message\": \"You have been rate limited. Please try again in a few minutes.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 429,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "rate_limited"
                    },
                    "message": {
                      "type": "string",
                      "example": "You have been rate limited. Please try again in a few minutes."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const response = await notion.pages.create({\n    \"cover\": {\n        \"type\": \"external\",\n        \"external\": {\n            \"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n        }\n    },\n    \"icon\": {\n        \"type\": \"emoji\",\n        \"emoji\": \"🥬\"\n    },\n    \"parent\": {\n        \"type\": \"database_id\",\n        \"database_id\": \"d9824bdc-8445-4327-be8b-5b47500af6ce\"\n    },\n    \"properties\": {\n        \"Name\": {\n            \"title\": [\n                {\n                    \"text\": {\n                        \"content\": \"Tuscan kale\"\n                    }\n                }\n            ]\n        },\n        \"Description\": {\n            \"rich_text\": [\n                {\n                    \"text\": {\n                        \"content\": \"A dark green leafy vegetable\"\n                    }\n                }\n            ]\n        },\n        \"Food group\": {\n            \"select\": {\n                \"name\": \"🥬 Vegetable\"\n            }\n        }\n    },\n    \"children\": [\n        {\n            \"object\": \"block\",\n            \"heading_2\": {\n                \"rich_text\": [\n                    {\n                        \"text\": {\n                            \"content\": \"Lacinato kale\"\n                        }\n                    }\n                ]\n            }\n        },\n        {\n            \"object\": \"block\",\n            \"paragraph\": {\n                \"rich_text\": [\n                    {\n                        \"text\": {\n                            \"content\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n                            \"link\": {\n                                \"url\": \"https://en.wikipedia.org/wiki/Lacinato_kale\"\n                            }\n                        },\n                        \"href\": \"https://en.wikipedia.org/wiki/Lacinato_kale\"\n                    }\n                ],\n                \"color\": \"default\"\n            }\n        }\n    ]\n});\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/pages' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Notion-Version: 2022-06-28\" \\\n  --data '{\n\t\"parent\": { \"database_id\": \"d9824bdc84454327be8b5b47500af6ce\" },\n  \"icon\": {\n  \t\"emoji\": \"🥬\"\n  },\n\t\"cover\": {\n\t\t\"external\": {\n\t\t\t\"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n\t\t}\n\t},\n\t\"properties\": {\n\t\t\"Name\": {\n\t\t\t\"title\": [\n\t\t\t\t{\n\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\"content\": \"Tuscan Kale\"\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t]\n\t\t},\n\t\t\"Description\": {\n\t\t\t\"rich_text\": [\n\t\t\t\t{\n\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\"content\": \"A dark green leafy vegetable\"\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t]\n\t\t},\n\t\t\"Food group\": {\n\t\t\t\"select\": {\n\t\t\t\t\"name\": \"Vegetable\"\n\t\t\t}\n\t\t},\n\t\t\"Price\": { \"number\": 2.5 }\n\t},\n\t\"children\": [\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"type\": \"heading_2\",\n\t\t\t\"heading_2\": {\n\t\t\t\t\"rich_text\": [{ \"type\": \"text\", \"text\": { \"content\": \"Lacinato kale\" } }]\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\t\"object\": \"block\",\n\t\t\t\"type\": \"paragraph\",\n\t\t\t\"paragraph\": {\n\t\t\t\t\"rich_text\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"type\": \"text\",\n\t\t\t\t\t\t\"text\": {\n\t\t\t\t\t\t\t\"content\": \"Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.\",\n\t\t\t\t\t\t\t\"link\": { \"url\": \"https://en.wikipedia.org/wiki/Lacinato_kale\" }\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t]\n\t\t\t}\n\t\t}\n\t]\n}'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:611ffc19e9237200478c6943"
}
```

---

# Retrieve a page

🚧 This endpoint will not accurately return properties that exceed 25 references: Do not use this endpoint if a page property includes more than 25 references to receive the full list of references. Instead, use the Retrieve a page property endpoint for the specific property to get its complete refe...

> 🚧 This endpoint will not accurately return properties that exceed 25 references
>
> Do **not** use this endpoint if a page property includes more than 25 references to receive the full list of references. Instead, use the [Retrieve a page property endpoint](https://developers.notion.com/reference/retrieve-a-page-property) for the specific property to get its complete reference list.

Retrieves a [Page object](ref:page) using the ID specified.

Responses contains page **properties**, not page content. To fetch page content, use the [Retrieve block children](https://developers.notion.com/reference/get-block-children) endpoint.

Page properties are limited to up to **25 references** per page property. To retrieve data related to properties that have more than 25 references, use the [Retrieve a page property](https://developers.notion.com/reference/retrieve-a-page-property#rollup-properties) endpoint. (See [Limits](https://developers.notion.com/reference/retrieve-a-page#limits) below for additional information.)

### Parent objects: Pages vs. databases

If a page’s [Parent object](https://developers.notion.com/reference/parent-object) is a database, then the property values will conform to the [database property schema](https://developers.notion.com/reference/property-object).

If a page object is not part of a database, then the only property value available for that page is its `title`.

### Limits

The endpoint returns a maximum of 25 page or person references per [page property](https://developers.notion.com/reference/property-value-object). If a page property includes more than 25 references, then the 26th reference and beyond might be returned as `Untitled`, `Anonymous`, or not be returned at all.

This limit affects the following properties:

- [`people`](https://developers.notion.com/reference/property-value-object#people-property-values): response object can’t be guaranteed to return more than 25 people.
- [`relation`](https://developers.notion.com/reference/property-value-object#relation-property-values): the `has_more` value of the `relation` in the response object is `true` if a `relation` contains more than 25 related pages. Otherwise, `has_more` is false.
- [`rich_text`](https://developers.notion.com/reference/property-value-object#rich-text-property-values): response object includes a maximum of 25 populated inline page or person mentions.
- [`title`](https://developers.notion.com/reference/property-value-object#title-property-values): response object includes a maximum of 25 inline page or person mentions.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have read content capabilities. Attempting to call this API without read content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

### Errors

Returns a 404 HTTP response if the page doesn't exist, or if the integration doesn't have access to the page.

Returns a 400 or 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the Error codes section of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/pages/{page_id}": {
      "get": {
        "summary": "Retrieve a page",
        "description": "",
        "operationId": "retrieve-a-page",
        "parameters": [
          {
            "name": "page_id",
            "in": "path",
            "description": "Identifier for a Notion page",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "filter_properties",
            "in": "query",
            "description": "A list of page property value IDs associated with the page. Use this param to limit the response to a specific page property value or values. To retrieve multiple properties, specify each page property ID. For example: `?filter_properties=iAk8&filter_properties=b7dh`.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"page\",\n  \"id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\",\n  \"created_time\": \"2022-03-01T19:05:00.000Z\",\n  \"last_edited_time\": \"2022-07-06T20:25:00.000Z\",\n  \"created_by\": {\n    \"object\": \"user\",\n    \"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n  },\n  \"last_edited_by\": {\n    \"object\": \"user\",\n    \"id\": \"0c3e9826-b8f7-4f73-927d-2caaf86f1103\"\n  },\n  \"cover\": {\n    \"type\": \"external\",\n    \"external\": {\n      \"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n    }\n  },\n  \"icon\": {\n    \"type\": \"emoji\",\n    \"emoji\": \"🥬\"\n  },\n  \"parent\": {\n    \"type\": \"database_id\",\n    \"database_id\": \"d9824bdc-8445-4327-be8b-5b47500af6ce\"\n  },\n  \"archived\": false,\n  \"properties\": {\n    \"Store availability\": {\n      \"id\": \"%3AUPp\",\n      \"type\": \"multi_select\",\n      \"multi_select\": [\n        {\n          \"id\": \"t|O@\",\n          \"name\": \"Gus's Community Market\",\n          \"color\": \"yellow\"\n        },\n        {\n          \"id\": \"{Ml\\\\\",\n          \"name\": \"Rainbow Grocery\",\n          \"color\": \"gray\"\n        }\n      ]\n    },\n    \"Food group\": {\n      \"id\": \"A%40Hk\",\n      \"type\": \"select\",\n      \"select\": {\n        \"id\": \"5e8e7e8f-432e-4d8a-8166-1821e10225fc\",\n        \"name\": \"🥬 Vegetable\",\n        \"color\": \"pink\"\n      }\n    },\n    \"Price\": {\n      \"id\": \"BJXS\",\n      \"type\": \"number\",\n      \"number\": 2.5\n    },\n    \"Responsible Person\": {\n      \"id\": \"Iowm\",\n      \"type\": \"people\",\n      \"people\": [\n        {\n          \"object\": \"user\",\n          \"id\": \"cbfe3c6e-71cf-4cd3-b6e7-02f38f371bcc\",\n          \"name\": \"Cristina Cordova\",\n          \"avatar_url\": \"https://lh6.googleusercontent.com/-rapvfCoTq5A/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nDKmmUpkpFvWNBzvu9rnZEy7cbl8Q/photo.jpg\",\n          \"type\": \"person\",\n          \"person\": {\n            \"email\": \"cristina@makenotion.com\"\n          }\n        }\n      ]\n    },\n    \"Last ordered\": {\n      \"id\": \"Jsfb\",\n      \"type\": \"date\",\n      \"date\": {\n        \"start\": \"2022-02-22\",\n        \"end\": null,\n        \"time_zone\": null\n      }\n    },\n    \"Cost of next trip\": {\n      \"id\": \"WOd%3B\",\n      \"type\": \"formula\",\n      \"formula\": {\n        \"type\": \"number\",\n        \"number\": 0\n      }\n    },\n    \"Recipes\": {\n      \"id\": \"YfIu\",\n      \"type\": \"relation\",\n      \"relation\": [\n        {\n          \"id\": \"90eeeed8-2cdd-4af4-9cc1-3d24aff5f63c\"\n        },\n        {\n          \"id\": \"a2da43ee-d43c-4285-8ae2-6d811f12629a\"\n        }\n      ],\n\t\t\t\"has_more\": false\n    },\n    \"Description\": {\n      \"id\": \"_Tc_\",\n      \"type\": \"rich_text\",\n      \"rich_text\": [\n        {\n          \"type\": \"text\",\n          \"text\": {\n            \"content\": \"A dark \",\n            \"link\": null\n          },\n          \"annotations\": {\n            \"bold\": false,\n            \"italic\": false,\n            \"strikethrough\": false,\n            \"underline\": false,\n            \"code\": false,\n            \"color\": \"default\"\n          },\n          \"plain_text\": \"A dark \",\n          \"href\": null\n        },\n        {\n          \"type\": \"text\",\n          \"text\": {\n            \"content\": \"green\",\n            \"link\": null\n          },\n          \"annotations\": {\n            \"bold\": false,\n            \"italic\": false,\n            \"strikethrough\": false,\n            \"underline\": false,\n            \"code\": false,\n            \"color\": \"green\"\n          },\n          \"plain_text\": \"green\",\n          \"href\": null\n        },\n        {\n          \"type\": \"text\",\n          \"text\": {\n            \"content\": \" leafy vegetable\",\n            \"link\": null\n          },\n          \"annotations\": {\n            \"bold\": false,\n            \"italic\": false,\n            \"strikethrough\": false,\n            \"underline\": false,\n            \"code\": false,\n            \"color\": \"default\"\n          },\n          \"plain_text\": \" leafy vegetable\",\n          \"href\": null\n        }\n      ]\n    },\n    \"In stock\": {\n      \"id\": \"%60%5Bq%3F\",\n      \"type\": \"checkbox\",\n      \"checkbox\": true\n    },\n    \"Number of meals\": {\n      \"id\": \"zag~\",\n      \"type\": \"rollup\",\n      \"rollup\": {\n        \"type\": \"number\",\n        \"number\": 2,\n        \"function\": \"count\"\n      }\n    },\n    \"Photo\": {\n      \"id\": \"%7DF_L\",\n      \"type\": \"url\",\n      \"url\": \"https://i.insider.com/612fb23c9ef1e50018f93198?width=1136&format=jpeg\"\n    },\n    \"Name\": {\n      \"id\": \"title\",\n      \"type\": \"title\",\n      \"title\": [\n        {\n          \"type\": \"text\",\n          \"text\": {\n            \"content\": \"Tuscan kale\",\n            \"link\": null\n          },\n          \"annotations\": {\n            \"bold\": false,\n            \"italic\": false,\n            \"strikethrough\": false,\n            \"underline\": false,\n            \"code\": false,\n            \"color\": \"default\"\n          },\n          \"plain_text\": \"Tuscan kale\",\n          \"href\": null\n        }\n      ]\n    }\n  },\n  \"url\": \"https://www.notion.so/Tuscan-kale-598337872cf94fdf8782e53db20768a5\",\n  \"public_url\": null\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "page"
                    },
                    "id": {
                      "type": "string",
                      "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-03-01T19:05:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-07-06T20:25:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "last_edited_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "0c3e9826-b8f7-4f73-927d-2caaf86f1103"
                        }
                      }
                    },
                    "cover": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "external"
                        },
                        "external": {
                          "type": "object",
                          "properties": {
                            "url": {
                              "type": "string",
                              "example": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                            }
                          }
                        }
                      }
                    },
                    "icon": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "emoji"
                        },
                        "emoji": {
                          "type": "string",
                          "example": "🥬"
                        }
                      }
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "database_id"
                        },
                        "database_id": {
                          "type": "string",
                          "example": "d9824bdc-8445-4327-be8b-5b47500af6ce"
                        }
                      }
                    },
                    "archived": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "properties": {
                      "type": "object",
                      "properties": {
                        "Store availability": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%3AUPp"
                            },
                            "type": {
                              "type": "string",
                              "example": "multi_select"
                            },
                            "multi_select": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "t|O@"
                                  },
                                  "name": {
                                    "type": "string",
                                    "example": "Gus's Community Market"
                                  },
                                  "color": {
                                    "type": "string",
                                    "example": "yellow"
                                  }
                                }
                              }
                            }
                          }
                        },
                        "Food group": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "A%40Hk"
                            },
                            "type": {
                              "type": "string",
                              "example": "select"
                            },
                            "select": {
                              "type": "object",
                              "properties": {
                                "id": {
                                  "type": "string",
                                  "example": "5e8e7e8f-432e-4d8a-8166-1821e10225fc"
                                },
                                "name": {
                                  "type": "string",
                                  "example": "🥬 Vegetable"
                                },
                                "color": {
                                  "type": "string",
                                  "example": "pink"
                                }
                              }
                            }
                          }
                        },
                        "Price": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "BJXS"
                            },
                            "type": {
                              "type": "string",
                              "example": "number"
                            },
                            "number": {
                              "type": "number",
                              "example": 2.5,
                              "default": 0
                            }
                          }
                        },
                        "Responsible Person": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Iowm"
                            },
                            "type": {
                              "type": "string",
                              "example": "people"
                            },
                            "people": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "object": {
                                    "type": "string",
                                    "example": "user"
                                  },
                                  "id": {
                                    "type": "string",
                                    "example": "cbfe3c6e-71cf-4cd3-b6e7-02f38f371bcc"
                                  },
                                  "name": {
                                    "type": "string",
                                    "example": "Cristina Cordova"
                                  },
                                  "avatar_url": {
                                    "type": "string",
                                    "example": "https://lh6.googleusercontent.com/-rapvfCoTq5A/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nDKmmUpkpFvWNBzvu9rnZEy7cbl8Q/photo.jpg"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "person"
                                  },
                                  "person": {
                                    "type": "object",
                                    "properties": {
                                      "email": {
                                        "type": "string",
                                        "example": "cristina@makenotion.com"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "Last ordered": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Jsfb"
                            },
                            "type": {
                              "type": "string",
                              "example": "date"
                            },
                            "date": {
                              "type": "object",
                              "properties": {
                                "start": {
                                  "type": "string",
                                  "example": "2022-02-22"
                                },
                                "end": {},
                                "time_zone": {}
                              }
                            }
                          }
                        },
                        "Cost of next trip": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "WOd%3B"
                            },
                            "type": {
                              "type": "string",
                              "example": "formula"
                            },
                            "formula": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "example": "number"
                                },
                                "number": {
                                  "type": "integer",
                                  "example": 0,
                                  "default": 0
                                }
                              }
                            }
                          }
                        },
                        "Recipes": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "YfIu"
                            },
                            "type": {
                              "type": "string",
                              "example": "relation"
                            },
                            "relation": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "90eeeed8-2cdd-4af4-9cc1-3d24aff5f63c"
                                  }
                                }
                              }
                            },
                            "has_more": {
                              "type": "boolean",
                              "example": false,
                              "default": true
                            }
                          }
                        },
                        "Description": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "_Tc_"
                            },
                            "type": {
                              "type": "string",
                              "example": "rich_text"
                            },
                            "rich_text": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "type": {
                                    "type": "string",
                                    "example": "text"
                                  },
                                  "text": {
                                    "type": "object",
                                    "properties": {
                                      "content": {
                                        "type": "string",
                                        "example": "A dark "
                                      },
                                      "link": {}
                                    }
                                  },
                                  "annotations": {
                                    "type": "object",
                                    "properties": {
                                      "bold": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "italic": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "strikethrough": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "underline": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "code": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "color": {
                                        "type": "string",
                                        "example": "default"
                                      }
                                    }
                                  },
                                  "plain_text": {
                                    "type": "string",
                                    "example": "A dark "
                                  },
                                  "href": {}
                                }
                              }
                            }
                          }
                        },
                        "In stock": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%60%5Bq%3F"
                            },
                            "type": {
                              "type": "string",
                              "example": "checkbox"
                            },
                            "checkbox": {
                              "type": "boolean",
                              "example": true,
                              "default": true
                            }
                          }
                        },
                        "Number of meals": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "zag~"
                            },
                            "type": {
                              "type": "string",
                              "example": "rollup"
                            },
                            "rollup": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "example": "number"
                                },
                                "number": {
                                  "type": "integer",
                                  "example": 2,
                                  "default": 0
                                },
                                "function": {
                                  "type": "string",
                                  "example": "count"
                                }
                              }
                            }
                          }
                        },
                        "Photo": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%7DF_L"
                            },
                            "type": {
                              "type": "string",
                              "example": "url"
                            },
                            "url": {
                              "type": "string",
                              "example": "https://i.insider.com/612fb23c9ef1e50018f93198?width=1136&format=jpeg"
                            }
                          }
                        },
                        "Name": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "title"
                            },
                            "type": {
                              "type": "string",
                              "example": "title"
                            },
                            "title": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "type": {
                                    "type": "string",
                                    "example": "text"
                                  },
                                  "text": {
                                    "type": "object",
                                    "properties": {
                                      "content": {
                                        "type": "string",
                                        "example": "Tuscan kale"
                                      },
                                      "link": {}
                                    }
                                  },
                                  "annotations": {
                                    "type": "object",
                                    "properties": {
                                      "bold": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "italic": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "strikethrough": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "underline": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "code": {
                                        "type": "boolean",
                                        "example": false,
                                        "default": true
                                      },
                                      "color": {
                                        "type": "string",
                                        "example": "default"
                                      }
                                    }
                                  },
                                  "plain_text": {
                                    "type": "string",
                                    "example": "Tuscan kale"
                                  },
                                  "href": {}
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "url": {
                      "type": "string",
                      "example": "https://www.notion.so/Tuscan-kale-598337872cf94fdf8782e53db20768a5"
                    },
                    "public_url": {}
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const pageId = '59833787-2cf9-4fdf-8782-e53db20768a5';\n  const response = await notion.pages.retrieve({ page_id: pageId });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/pages/b55c9c91-384d-452b-81db-d1ef79372b75' \\\n  -H 'Notion-Version: 2022-06-28' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"''"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:611ffa8eeb136f0016ce621c"
}
```

---

# Retrieve a page property item

Retrieves a property_item object for a given page_id and property_id . Depending on the property type, the object returned will either be a value or a paginated list of property item values. See Property item objects for specifics. To obtain property_id 's, use the Retrieve a database endpoint. In c...

Retrieves a `property_item` object for a given `page_id` and `property_id`.  Depending on the property type, the object returned will either be a value or a [paginated](ref:pagination) list of property item values. See [Property item objects](https://developers.notion.com/reference/property-item-object) for specifics.

To obtain `property_id`'s, use the [Retrieve a database](ref:retrieve-a-database) endpoint.

In cases where a property item has more than 25 references, this endpoint should be used, rather than [Retrieve a page](https://developers.notion.com/reference/retrieve-a-page). ([Retrieve a page ](https://developers.notion.com/reference/retrieve-a-page) will not return a complete list when the list exceeds 25 references.)

## Property Item Objects

For more detailed information refer to the [Property item object documentation](https://developers.notion.com/reference/property-item-object)

### Simple Properties

Each individual `property_item` properties will have a `type` and under the the key with the value for `type`, an object that identifies the property value, documented under [Property value objects](ref:page#property-value-object).

### Paginated Properties

Property types that return a paginated list of property item objects are:

- `title`
- `rich_text`
- `relation`
- `people`

Look for the `next_url` value in the response object for these property items to view paginated results. Refer to [paginated page properties](https://developers.notion.com/reference/page-property-values#paginated-page-properties) for a full description of the response object for these properties.

Refer to the [pagination reference](https://developers.notion.com/reference/intro#pagination) for details on how to iterate through a results list.

### Rollup Properties

> 👍
>
> Learn more about rollup properties on the [Page properties page](https://developers.notion.com/reference/page-property-values#rollup) or in Notion’s [Help Center](https://www.notion.so/help/relations-and-rollups).

For regular "Show original" rollups, the endpoint returns a flattened list of all the property items in the rollup.

For rollups with an aggregation, the API returns a [rollup property value](ref:page#rollup-property-values) under the `rollup` key and the list of relations.

In order to avoid timeouts, if the rollup has a with a large number of aggregations or properties the endpoint returns a `next_cursor` value that is used to determinate the aggregation value _so far_ for the subset of relations that have been paginated through.

Once `has_more` is `false`, then the final rollup value is returned.  Refer to the [Pagination documentation](ref:pagination) for more information on pagination in the Notion API.

Computing the values of following aggregations are _not_ supported. Instead the endpoint returns a list of `property_item` objects for the rollup:

- `show_unique` (Show unique values)
- `unique` (Count unique values)
- `median`(Median)

> 📘 Integration capabilities
>
> This endpoint requires an integration to have read content capabilities. Attempting to call this API without read content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

### Errors

Returns a 404 HTTP response if the page or property doesn't exist, or if the integration doesn't have access to the page.

Returns a 400 or 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/pages/{page_id}/properties/{property_id}": {
      "get": {
        "summary": "Retrieve a page property item",
        "description": "",
        "operationId": "retrieve-a-page-property",
        "parameters": [
          {
            "name": "page_id",
            "in": "path",
            "description": "Identifier for a Notion page",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "property_id",
            "in": "path",
            "description": "Identifier for a page [property](https://developers.notion.com/reference/page#all-property-values)",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "page_size",
            "in": "query",
            "description": "For paginated properties. The max number of property item objects on a page. The default size is 100",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "start_cursor",
            "in": "query",
            "description": "For paginated properties.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Number Property Item": {
                    "value": "{\n  \"object\": \"property_item\",\n  \"id\" \"kjPO\",\n  \"type\": \"number\",\n  \"number\": 2\n}"
                  },
                  "Result": {
                    "value": "{\n    \"object\": \"list\",\n    \"results\": [\n        {\n            \"object\": \"property_item\",\n            \"id\" \"kjPO\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {\n                \"type\": \"text\",\n                \"text\": {\n                    \"content\": \"Avocado \",\n                    \"link\": null\n                },\n                \"annotations\": {\n                    \"bold\": false,\n                    \"italic\": false,\n                    \"strikethrough\": false,\n                    \"underline\": false,\n                    \"code\": false,\n                    \"color\": \"default\"\n                },\n                \"plain_text\": \"Avocado \",\n                \"href\": null\n            }\n        },\n        {\n            \"object\": \"property_item\",\n            \"id\" \"ijPO\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {\n                \"type\": \"mention\",\n                \"mention\": {\n                    \"type\": \"page\",\n                    \"page\": {\n                        \"id\": \"41117fd7-69a5-4694-bc07-c1e3a682c857\"\n                    }\n                },\n                \"annotations\": {\n                    \"bold\": false,\n                    \"italic\": false,\n                    \"strikethrough\": false,\n                    \"underline\": false,\n                    \"code\": false,\n                    \"color\": \"default\"\n                },\n                \"plain_text\": \"Lemons\",\n                \"href\": \"http://notion.so/41117fd769a54694bc07c1e3a682c857\"\n            }\n        },\n        {\n            \"object\": \"property_item\",\n            \"id\" \"kjPO\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {\n                \"type\": \"text\",\n                \"text\": {\n                    \"content\": \" Tomato \",\n                    \"link\": null\n                },\n                \"annotations\": {\n                    \"bold\": false,\n                    \"italic\": false,\n                    \"strikethrough\": false,\n                    \"underline\": false,\n                    \"code\": false,\n                    \"color\": \"default\"\n                },\n                \"plain_text\": \" Tomato \",\n                \"href\": null\n            }\n        },\n...\n    ],\n    \"next_cursor\": \"some-next-cursor-value\",\n    \"has_more\": true,\n\t\t\"next_url\": \"http://api.notion.com/v1/pages/0e5235bf86aa4efb93aa772cce7eab71/properties/NVv^?start_cursor=some-next-cursor-value&page_size=25\",\n    \"property_item\": {\n      \"id\": \"NVv^\",\n      \"next_url\": null,\n      \"type\": \"rich_text\",\n      \"rich_text\": {}\n    }\n}"
                  },
                  "Rollup List Property Item": {
                    "value": "{\n    \"object\": \"list\",\n    \"results\": [\n        {\n            \"object\": \"property_item\",\n          \t\"id\": \"dj2l\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"id\": \"83f92c9d-523d-466e-8c1f-9bc2c25a99fe\"\n            }\n        },\n        {\n            \"object\": \"property_item\",\n          \t\"id\": \"dj2l\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"id\": \"45cfb825-3463-4891-8932-7e6d8c170630\"\n            }\n        },\n        {\n            \"object\": \"property_item\",\n          \t\"id\": \"dj2l\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"id\": \"1688be1a-a197-4f2a-9688-e528c4b56d94\"\n            }\n        }\n    ],\n    \"next_cursor\": \"some-next-cursor-value\",\n    \"has_more\": true,\n\t\t\"property_item\": {\n      \"id\": \"y}~p\",\n      \"next_url\": \"http://api.notion.com/v1/pages/0e5235bf86aa4efb93aa772cce7eab71/properties/y%7D~p?start_cursor=1QaTunT5&page_size=25\",\n      \"type\": \"rollup\",\n      \"rollup\": {\n        \"function\": \"sum\",\n        \"type\": \"incomplete\",\n        \"incomplete\": {}\n      }\n    }\n    \"type\": \"property_item\"\n}"
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const pageId = 'b55c9c91-384d-452b-81db-d1ef79372b75';\n  const propertyId = \"aBcD123\n  const response = await notion.pages.properties.retrieve({ page_id: pageId, property_id: propertyId });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl --request GET \\\n  --url https://api.notion.com/v1/pages/b55c9c91-384d-452b-81db-d1ef79372b75/properties/some-property-id \\\n  --header 'Authorization: Bearer $NOTION_API_KEY' \\\n  --header 'Notion-Version: 2022-06-28'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:614943b3de71ea001c546257"
}
```

---

# Update page properties

Updates the properties of a page in a database. The properties body param of this endpoint can only be used to update the properties of a page that is a child of a database. The page’s properties schema must match the parent database’s properties . This endpoint can be used to update any page icon o...

Updates the `properties` of a page in a database. The `properties` body param of this endpoint can only be used to update the `properties` of a page that is a child of a database. The page’s `properties` schema must match the parent [database’s properties](https://developers.notion.com/reference/property-object).

This endpoint can be used to update any page `icon` or `cover`, and can be used to [`delete`](https://developers.notion.com/reference/archive-a-page) or restore any page.

To add page content instead of page properties, use the [append block children](https://developers.notion.com/reference/patch-block-children) endpoint. The `page_id` can be passed as the `block_id` when adding block children to the page.

Returns the updated [page object](https://developers.notion.com/reference/page).

> 📘 Requirements
>
> Your integration must have [update content capabilities](https://developers.notion.com/reference/capabilities#content-capabilities) on the target page in order to call this endpoint. To update your integrations capabilities, navigation to the [My integrations](https://www.notion.so/my-integrations) dashboard, select your integration, go to the **Capabilities** tab, and update your settings as needed.
>
> Attempting a query without update content capabilities returns an HTTP response with a 403 status code.

> 🚧 Limitations
>
> - Updating [rollup property values](https://developers.notion.com/reference/property-value-object#rollup-property-values) is not supported.
> - A page’s `parent` cannot be changed.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/pages/{page_id}": {
      "patch": {
        "summary": "Update page properties",
        "description": "",
        "operationId": "patch-page",
        "parameters": [
          {
            "name": "page_id",
            "in": "path",
            "description": "The identifier for the Notion page to be updated.",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "properties": {
                    "type": "string",
                    "description": "The property values to update for the page. The keys are the names or IDs of the property and the values are property values. If a page property ID is not included, then it is not changed.",
                    "format": "json"
                  },
                  "in_trash": {
                    "type": "boolean",
                    "description": "Set to true to delete a block. Set to false to restore a block.",
                    "default": false
                  },
                  "icon": {
                    "type": "string",
                    "description": "A page icon for the page. Supported types are [external file object](https://developers.notion.com/reference/file-object) or [emoji object](https://developers.notion.com/reference/emoji-object).",
                    "format": "json"
                  },
                  "cover": {
                    "type": "string",
                    "description": "A cover image for the page. Only [external file objects](https://developers.notion.com/reference/file-object) are supported.",
                    "format": "json"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"page\",\n\t\"id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\",\n\t\"created_time\": \"2022-03-01T19:05:00.000Z\",\n\t\"last_edited_time\": \"2022-07-06T19:16:00.000Z\",\n\t\"created_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t},\n\t\"last_edited_by\": {\n\t\t\"object\": \"user\",\n\t\t\"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n\t},\n\t\"cover\": {\n\t\t\"type\": \"external\",\n\t\t\"external\": {\n\t\t\t\"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n\t\t}\n\t},\n\t\"icon\": {\n\t\t\"type\": \"emoji\",\n\t\t\"emoji\": \"🥬\"\n\t},\n\t\"parent\": {\n\t\t\"type\": \"database_id\",\n\t\t\"database_id\": \"d9824bdc-8445-4327-be8b-5b47500af6ce\"\n\t},\n\t\"archived\": false,\n\t\"properties\": {\n\t\t\"Store availability\": {\n\t\t\t\"id\": \"%3AUPp\"\n\t\t},\n\t\t\"Food group\": {\n\t\t\t\"id\": \"A%40Hk\"\n\t\t},\n\t\t\"Price\": {\n\t\t\t\"id\": \"BJXS\"\n\t\t},\n\t\t\"Responsible Person\": {\n\t\t\t\"id\": \"Iowm\"\n\t\t},\n\t\t\"Last ordered\": {\n\t\t\t\"id\": \"Jsfb\"\n\t\t},\n\t\t\"Cost of next trip\": {\n\t\t\t\"id\": \"WOd%3B\"\n\t\t},\n\t\t\"Recipes\": {\n\t\t\t\"id\": \"YfIu\"\n\t\t},\n\t\t\"Description\": {\n\t\t\t\"id\": \"_Tc_\"\n\t\t},\n\t\t\"In stock\": {\n\t\t\t\"id\": \"%60%5Bq%3F\"\n\t\t},\n\t\t\"Number of meals\": {\n\t\t\t\"id\": \"zag~\"\n\t\t},\n\t\t\"Photo\": {\n\t\t\t\"id\": \"%7DF_L\"\n\t\t},\n\t\t\"Name\": {\n\t\t\t\"id\": \"title\"\n\t\t}\n\t},\n\t\"url\": \"https://www.notion.so/Tuscan-Kale-598337872cf94fdf8782e53db20768a5\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "page"
                    },
                    "id": {
                      "type": "string",
                      "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-03-01T19:05:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-07-06T19:16:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "last_edited_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                        }
                      }
                    },
                    "cover": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "external"
                        },
                        "external": {
                          "type": "object",
                          "properties": {
                            "url": {
                              "type": "string",
                              "example": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                            }
                          }
                        }
                      }
                    },
                    "icon": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "emoji"
                        },
                        "emoji": {
                          "type": "string",
                          "example": "🥬"
                        }
                      }
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "database_id"
                        },
                        "database_id": {
                          "type": "string",
                          "example": "d9824bdc-8445-4327-be8b-5b47500af6ce"
                        }
                      }
                    },
                    "archived": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "properties": {
                      "type": "object",
                      "properties": {
                        "Store availability": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%3AUPp"
                            }
                          }
                        },
                        "Food group": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "A%40Hk"
                            }
                          }
                        },
                        "Price": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "BJXS"
                            }
                          }
                        },
                        "Responsible Person": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Iowm"
                            }
                          }
                        },
                        "Last ordered": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Jsfb"
                            }
                          }
                        },
                        "Cost of next trip": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "WOd%3B"
                            }
                          }
                        },
                        "Recipes": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "YfIu"
                            }
                          }
                        },
                        "Description": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "_Tc_"
                            }
                          }
                        },
                        "In stock": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%60%5Bq%3F"
                            }
                          }
                        },
                        "Number of meals": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "zag~"
                            }
                          }
                        },
                        "Photo": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%7DF_L"
                            }
                          }
                        },
                        "Name": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "title"
                            }
                          }
                        }
                      }
                    },
                    "url": {
                      "type": "string",
                      "example": "https://www.notion.so/Tuscan-Kale-598337872cf94fdf8782e53db20768a5"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  },
                  "has_more is set to true for a page property": {
                    "value": "{\n  \"object\": \"error\",\n  \"status\": 400,\n  \"code\": \"invalid_request\",\n  \"message\": ”Can't update page because has_more is set to true for page property '${invalidPageProperty}’”\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          },
          "404": {
            "description": "404",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 404,\n    \"code\": \"object_not_found\",\n    \"message\": \"Could not find page with ID: 4cc3b486-0b48-4cfe-8ce9-67c47100eb6a. Make sure the relevant pages and databases are shared with your integration.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 404,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "object_not_found"
                    },
                    "message": {
                      "type": "string",
                      "example": "Could not find page with ID: 4cc3b486-0b48-4cfe-8ce9-67c47100eb6a. Make sure the relevant pages and databases are shared with your integration."
                    }
                  }
                }
              }
            }
          },
          "429": {
            "description": "429",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"error\",\n  \"status\": 429,\n  \"code\": \"rate_limited\",\n  \"message\": \"You have been rate limited. Please try again in a few minutes.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 429,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "rate_limited"
                    },
                    "message": {
                      "type": "string",
                      "example": "You have been rate limited. Please try again in a few minutes."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const pageId = '59833787-2cf9-4fdf-8782-e53db20768a5';\n  const response = await notion.pages.update({\n    page_id: pageId,\n    properties: {\n      'In stock': {\n        checkbox: true,\n      },\n    },\n  });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl https://api.notion.com/v1/pages/60bdc8bd-3880-44b8-a9cd-8a145b3ffbd7 \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Notion-Version: 2022-06-28\" \\\n  -X PATCH \\\n\t--data '{\n  \"properties\": {\n    \"In stock\": { \"checkbox\": true }\n  }\n}'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:611ffcf84f24e0003b3533ee"
}
```

---

# Trash a page

📘 The API does not support permanently deleting pages. To archive a page via the API, send an Update page request with the archived (or in_trash ) body param set to true . To restore a page, set archived (or in_trash ) to false . Example request: archive a Notion page curl https://api.notion.com/v1...

> 📘
>
> The API does not support permanently deleting pages.

To archive a page via the API, send an [Update page](https://developers.notion.com/reference/patch-page) request with the `archived` (or `in_trash`) body param set to `true`. To restore a page, set `archived` (or `in_trash`) to `false`.

## Example request: archive a Notion page

```curl
curl https://api.notion.com/v1/pages/60bdc8bd-3880-44b8-a9cd-8a145b3ffbd7 \
  -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -X PATCH \
	--data '{
    "archived": true
}'
```

If you are using Notion’s [JavaScript SDK](https://github.com/makenotion/notion-sdk-js) to interact with the REST API, use the `update` method available for Notion pages.

```javascript
const { Client } = require("@notionhq/client")

// Initializing a client
const notion = new Client({
	auth: process.env.NOTION_API_KEY,
})

const archivePage = async () => {
	await notion.pages.update({
	  page_id: pageId,
	  archived: true, // or in_trash: true
	});
}
```

If successful, the API responds with a `200` HTTP status code and the archived page object, as in the following example:

```json
{
    "object": "page",
    "id": "be633bf1-dfa0-436d-b259-571129a590e5",
    "created_time": "2022-10-24T22:54:00.000Z",
    "last_edited_time": "2023-03-08T18:25:00.000Z",
    "created_by": {
        "object": "user",
        "id": "c2f20311-9e54-4d11-8c79-7398424ae41e"
    },
    "last_edited_by": {
        "object": "user",
        "id": "9188c6a5-7381-452f-b3dc-d4865aa89bdf"
    },
    "cover": null,
    "icon": {
        "type": "emoji",
        "emoji": "🐞"
    },
    "parent": {
        "type": "database_id",
        "database_id": "a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822b"
    },
    "archived": true,
  	"in_trash": true,
    "properties": {
        "Due date": {
            "id": "M%3BBw",
            "type": "date",
            "date": {
                "start": "2023-02-23",
                "end": null,
                "time_zone": null
            }
        },
        "Status": {
            "id": "Z%3ClH",
            "type": "status",
            "status": {
                "id": "86ddb6ec-0627-47f8-800d-b65afd28be13",
                "name": "Not started",
                "color": "default"
            }
        },
        "Title": {
            "id": "title",
            "type": "title",
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "Bug bash",
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
                    "plain_text": "Bug bash",
                    "href": null
                }
            ]
        }
    },
    "url": "https://www.notion.so/Bug-bash-be633bf1dfa0436db259571129a590e5"
}
```

Refer to the [error codes](https://developers.notion.com/reference/status-codes#error-codes) documentation for possible errors.

## Example request: restore a Notion page

```curl
curl https://api.notion.com/v1/pages/60bdc8bd-3880-44b8-a9cd-8a145b3ffbd7 \
  -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -X PATCH \
	--data '{
    "archived": false
}'
```

```javascript
// Restore an archived page using the Notion JavaScript SDK
const restorePage = async () => {
	await notion.pages.update({
	  page_id: pageId,
	  archived: false,
	});
}
```

If successful, the API responds with a `200` HTTP status code and the restored [page object](https://developers.notion.com/reference/page). Refer to the [error codes](https://developers.notion.com/reference/status-codes#error-codes) documentation for possible errors.

---

# Create a database

Creates a database as a subpage in the specified parent page, with the specified properties schema. Currently, the parent of a new database must be a Notion page or a wiki database . 📘 Integration capabilities: This endpoint requires an integration to have insert content capabilities. Attempting to...

Creates a database as a subpage in the specified parent page, with the specified properties schema. Currently, the parent of a new database must be a Notion page or a [wiki database](https://www.notion.so/help/wikis-and-verified-pages).

> 📘 Integration capabilities
>
> This endpoint requires an integration to have insert content capabilities. Attempting to call this API without insert content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

> 🚧 Limitations
>
> Creating new `status` database properties is currently not supported.

### Errors

Returns a 404 if the specified parent page does not exist, or if the integration does not have access to the parent page.

Returns a 400 if the request is incorrectly formatted, or a 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/databases": {
      "post": {
        "summary": "Create a database",
        "description": "",
        "operationId": "create-a-database",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "parent",
                  "properties"
                ],
                "properties": {
                  "parent": {
                    "type": "string",
                    "description": "A [page parent](/reference/database#page-parent)",
                    "format": "json"
                  },
                  "title": {
                    "type": "array",
                    "description": "Title of database as it appears in Notion. An array of [rich text objects](ref:rich-text)."
                  },
                  "properties": {
                    "type": "string",
                    "description": "Property schema of database. The keys are the names of properties as they appear in Notion and the values are [property schema objects](https://developers.notion.com/reference/property-schema-object).",
                    "format": "json"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"database\",\n    \"id\": \"bc1211ca-e3f1-4939-ae34-5260b16f627c\",\n    \"created_time\": \"2021-07-08T23:50:00.000Z\",\n    \"last_edited_time\": \"2021-07-08T23:50:00.000Z\",\n    \"icon\": {\n        \"type\": \"emoji\",\n        \"emoji\": \"🎉\"\n    },\n    \"cover\": {\n        \"type\": \"external\",\n        \"external\": {\n            \"url\": \"https://website.domain/images/image.png\"\n        }\n    },\n    \"url\": \"https://www.notion.so/bc1211cae3f14939ae34260b16f627c\",\n    \"title\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Grocery List\",\n                \"link\": null\n            },\n            \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n            },\n            \"plain_text\": \"Grocery List\",\n            \"href\": null\n        }\n    ],\n    \"properties\": {\n        \"+1\": {\n            \"id\": \"Wp%3DC\",\n            \"name\": \"+1\",\n            \"type\": \"people\",\n            \"people\": {}\n        },\n        \"In stock\": {\n            \"id\": \"fk%5EY\",\n            \"name\": \"In stock\",\n            \"type\": \"checkbox\",\n            \"checkbox\": {}\n        },\n        \"Price\": {\n            \"id\": \"evWq\",\n            \"name\": \"Price\",\n            \"type\": \"number\",\n            \"number\": {\n                \"format\": \"dollar\"\n            }\n        },\n        \"Description\": {\n            \"id\": \"V}lX\",\n            \"name\": \"Description\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {}\n        },\n        \"Last ordered\": {\n            \"id\": \"eVnV\",\n            \"name\": \"Last ordered\",\n            \"type\": \"date\",\n            \"date\": {}\n        },\n        \"Meals\": {\n            \"id\": \"%7DWA~\",\n            \"name\": \"Meals\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"database_id\": \"668d797c-76fa-4934-9b05-ad288df2d136\",\n                \"single_property\": {}\n            }\n        },\n        \"Number of meals\": {\n            \"id\": \"Z\\\\Eh\",\n            \"name\": \"Number of meals\",\n            \"type\": \"rollup\",\n            \"rollup\": {\n                \"rollup_property_name\": \"Name\",\n                \"relation_property_name\": \"Meals\",\n                \"rollup_property_id\": \"title\",\n                \"relation_property_id\": \"mxp^\",\n                \"function\": \"count\"\n            }\n        },\n        \"Store availability\": {\n            \"id\": \"s}Kq\",\n            \"name\": \"Store availability\",\n            \"type\": \"multi_select\",\n            \"multi_select\": {\n                \"options\": [\n                    {\n                        \"id\": \"cb79b393-d1c1-4528-b517-c450859de766\",\n                        \"name\": \"Duc Loi Market\",\n                        \"color\": \"blue\"\n                    },\n                    {\n                        \"id\": \"58aae162-75d4-403b-a793-3bc7308e4cd2\",\n                        \"name\": \"Rainbow Grocery\",\n                        \"color\": \"gray\"\n                    },\n                    {\n                        \"id\": \"22d0f199-babc-44ff-bd80-a9eae3e3fcbf\",\n                        \"name\": \"Nijiya Market\",\n                        \"color\": \"purple\"\n                    },\n                    {\n                        \"id\": \"0d069987-ffb0-4347-bde2-8e4068003dbc\",\n                        \"name\": \"Gus's Community Market\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"Photo\": {\n            \"id\": \"yfiK\",\n            \"name\": \"Photo\",\n            \"type\": \"files\",\n            \"files\": {}\n        },\n        \"Food group\": {\n            \"id\": \"CM%3EH\",\n            \"name\": \"Food group\",\n            \"type\": \"select\",\n            \"select\": {\n                \"options\": [\n                    {\n                        \"id\": \"6d4523fa-88cb-4ffd-9364-1e39d0f4e566\",\n                        \"name\": \"🥦Vegetable\",\n                        \"color\": \"green\"\n                    },\n                    {\n                        \"id\": \"268d7e75-de8f-4c4b-8b9d-de0f97021833\",\n                        \"name\": \"🍎Fruit\",\n                        \"color\": \"red\"\n                    },\n                    {\n                        \"id\": \"1b234a00-dc97-489c-b987-829264cfdfef\",\n                        \"name\": \"💪Protein\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"Name\": {\n            \"id\": \"title\",\n            \"name\": \"Name\",\n            \"type\": \"title\",\n            \"title\": {}\n        }\n    },\n    \"parent\": {\n        \"type\": \"page_id\",\n        \"page_id\": \"98ad959b-2b6a-4774-80ee-00246fb0ea9b\"\n    },\n    \"archived\": false\n}{\n    \"object\": \"database\",\n    \"id\": \"bc1211ca-e3f1-4939-ae34-5260b16f627c\",\n    \"created_time\": \"2021-07-08T23:50:00.000Z\",\n    \"last_edited_time\": \"2021-07-08T23:50:00.000Z\",\n    \"icon\": {\n        \"type\": \"emoji\",\n        \"emoji\": \"🎉\"\n    },\n    \"cover\": {\n        \"type\": \"external\",\n        \"external\": {\n            \"url\": \"https://website.domain/images/image.png\"\n        }\n    },\n    \"url\": \"https://www.notion.so/bc1211cae3f14939ae34260b16f627c\",\n    \"title\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Grocery List\",\n                \"link\": null\n            },\n            \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n            },\n            \"plain_text\": \"Grocery List\",\n            \"href\": null\n        }\n    ],\n    \"properties\": {\n        \"+1\": {\n            \"id\": \"Wp%3DC\",\n            \"name\": \"+1\",\n            \"type\": \"people\",\n            \"people\": {}\n        },\n        \"In stock\": {\n            \"id\": \"fk%5EY\",\n            \"name\": \"In stock\",\n            \"type\": \"checkbox\",\n            \"checkbox\": {}\n        },\n        \"Price\": {\n            \"id\": \"evWq\",\n            \"name\": \"Price\",\n            \"type\": \"number\",\n            \"number\": {\n                \"format\": \"dollar\"\n            }\n        },\n        \"Description\": {\n            \"id\": \"V}lX\",\n            \"name\": \"Description\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {}\n        },\n        \"Last ordered\": {\n            \"id\": \"eVnV\",\n            \"name\": \"Last ordered\",\n            \"type\": \"date\",\n            \"date\": {}\n        },\n        \"Meals\": {\n            \"id\": \"%7DWA~\",\n            \"name\": \"Meals\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"database_id\": \"668d797c-76fa-4934-9b05-ad288df2d136\",\n                \"synced_property_name\": \"Related to Grocery List (Meals)\"\n            }\n        },\n        \"Number of meals\": {\n            \"id\": \"Z\\\\Eh\",\n            \"name\": \"Number of meals\",\n            \"type\": \"rollup\",\n            \"rollup\": {\n                \"rollup_property_name\": \"Name\",\n                \"relation_property_name\": \"Meals\",\n                \"rollup_property_id\": \"title\",\n                \"relation_property_id\": \"mxp^\",\n                \"function\": \"count\"\n            }\n        },\n        \"Store availability\": {\n            \"id\": \"s}Kq\",\n            \"name\": \"Store availability\",\n            \"type\": \"multi_select\",\n            \"multi_select\": {\n                \"options\": [\n                    {\n                        \"id\": \"cb79b393-d1c1-4528-b517-c450859de766\",\n                        \"name\": \"Duc Loi Market\",\n                        \"color\": \"blue\"\n                    },\n                    {\n                        \"id\": \"58aae162-75d4-403b-a793-3bc7308e4cd2\",\n                        \"name\": \"Rainbow Grocery\",\n                        \"color\": \"gray\"\n                    },\n                    {\n                        \"id\": \"22d0f199-babc-44ff-bd80-a9eae3e3fcbf\",\n                        \"name\": \"Nijiya Market\",\n                        \"color\": \"purple\"\n                    },\n                    {\n                        \"id\": \"0d069987-ffb0-4347-bde2-8e4068003dbc\",\n                        \"name\": \"Gus's Community Market\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"Photo\": {\n            \"id\": \"yfiK\",\n            \"name\": \"Photo\",\n            \"type\": \"files\",\n            \"files\": {}\n        },\n        \"Food group\": {\n            \"id\": \"CM%3EH\",\n            \"name\": \"Food group\",\n            \"type\": \"select\",\n            \"select\": {\n                \"options\": [\n                    {\n                        \"id\": \"6d4523fa-88cb-4ffd-9364-1e39d0f4e566\",\n                        \"name\": \"🥦Vegetable\",\n                        \"color\": \"green\"\n                    },\n                    {\n                        \"id\": \"268d7e75-de8f-4c4b-8b9d-de0f97021833\",\n                        \"name\": \"🍎Fruit\",\n                        \"color\": \"red\"\n                    },\n                    {\n                        \"id\": \"1b234a00-dc97-489c-b987-829264cfdfef\",\n                        \"name\": \"💪Protein\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"Name\": {\n            \"id\": \"title\",\n            \"name\": \"Name\",\n            \"type\": \"title\",\n            \"title\": {}\n        }\n    },\n    \"parent\": {\n        \"type\": \"page_id\",\n        \"page_id\": \"98ad959b-2b6a-4774-80ee-00246fb0ea9b\"\n    },\n    \"archived\": false,\n    \"is_inline\": false\n}"
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "curl",
              "code": "curl --location --request POST 'https://api.notion.com/v1/databases/' \\\n--header 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n--header 'Content-Type: application/json' \\\n--header 'Notion-Version: 2022-06-28' \\\n--data '{\n    \"parent\": {\n        \"type\": \"page_id\",\n        \"page_id\": \"98ad959b-2b6a-4774-80ee-00246fb0ea9b\"\n    },\n    \"icon\": {\n    \t\"type\": \"emoji\",\n\t\t\t\"emoji\": \"📝\"\n  \t},\n  \t\"cover\": {\n  \t\t\"type\": \"external\",\n    \t\"external\": {\n    \t\t\"url\": \"https://website.domain/images/image.png\"\n    \t}\n  \t},\n    \"title\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Grocery List\",\n                \"link\": null\n            }\n        }\n    ],\n    \"properties\": {\n        \"Name\": {\n            \"title\": {}\n        },\n        \"Description\": {\n            \"rich_text\": {}\n        },\n        \"In stock\": {\n            \"checkbox\": {}\n        },\n        \"Food group\": {\n            \"select\": {\n                \"options\": [\n                    {\n                        \"name\": \"🥦Vegetable\",\n                        \"color\": \"green\"\n                    },\n                    {\n                        \"name\": \"🍎Fruit\",\n                        \"color\": \"red\"\n                    },\n                    {\n                        \"name\": \"💪Protein\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"Price\": {\n            \"number\": {\n                \"format\": \"dollar\"\n            }\n        },\n        \"Last ordered\": {\n            \"date\": {}\n        },\n        \"Meals\": {\n          \"relation\": {\n            \"database_id\": \"668d797c-76fa-4934-9b05-ad288df2d136\",\n            \"single_property\": {}\n          }\n    \t\t},\n        \"Number of meals\": {\n          \"rollup\": {\n            \"rollup_property_name\": \"Name\",\n            \"relation_property_name\": \"Meals\",\n            \"function\": \"count\"\n          }\n        },\n        \"Store availability\": {\n            \"type\": \"multi_select\",\n            \"multi_select\": {\n                \"options\": [\n                    {\n                        \"name\": \"Duc Loi Market\",\n                        \"color\": \"blue\"\n                    },\n                    {\n                        \"name\": \"Rainbow Grocery\",\n                        \"color\": \"gray\"\n                    },\n                    {\n                        \"name\": \"Nijiya Market\",\n                        \"color\": \"purple\"\n                    },\n                    {\n                        \"name\": \"Gus'\\''s Community Market\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"+1\": {\n            \"people\": {}\n        },\n        \"Photo\": {\n            \"files\": {}\n        }\n    }\n}'"
            },
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const response = await notion.databases.create({\n      parent: {\n        type: \"page_id\",\n        page_id: \"98ad959b-2b6a-4774-80ee-00246fb0ea9b\",\n      },\n      icon: {\n        type: \"emoji\",\n        emoji: \"📝\",\n      },\n      cover: {\n        type: \"external\",\n        external: {\n          url: \"https://website.domain/images/image.png\",\n        },\n      },\n      title: [\n        {\n          type: \"text\",\n          text: {\n            content: \"Grocery List\",\n            link: null,\n          },\n        },\n      ],\n      properties: {\n        Name: {\n          title: {},\n        },\n        Description: {\n          rich_text: {},\n        },\n        \"In stock\": {\n          checkbox: {},\n        },\n        \"Food group\": {\n          select: {\n            options: [\n              {\n                name: \"🥦Vegetable\",\n                color: \"green\",\n              },\n              {\n                name: \"🍎Fruit\",\n                color: \"red\",\n              },\n              {\n                name: \"💪Protein\",\n                color: \"yellow\",\n              },\n            ],\n          },\n        },\n        Price: {\n          number: {\n            format: \"dollar\",\n          },\n        },\n        \"Last ordered\": {\n          date: {},\n        },\n        Meals: {\n          relation: {\n            database_id: \"668d797c-76fa-4934-9b05-ad288df2d136\",\n            single_property: {},\n          },\n        },\n        \"Number of meals\": {\n          rollup: {\n            rollup_property_name: \"Name\",\n            relation_property_name: \"Meals\",\n            function: \"count\",\n          },\n        },\n        \"Store availability\": {\n          type: \"multi_select\",\n          multi_select: {\n            options: [\n              {\n                name: \"Duc Loi Market\",\n                color: \"blue\",\n              },\n              {\n                name: \"Rainbow Grocery\",\n                color: \"gray\",\n              },\n              {\n                name: \"Nijiya Market\",\n                color: \"purple\",\n              },\n              {\n                name: \"Gus'''s Community Market\",\n                color: \"yellow\",\n              },\n            ],\n          },\n        },\n        \"+1\": {\n          people: {},\n        },\n        Photo: {\n          files: {},\n        },\n      },\n    });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            }
          ],
          "samples-languages": [
            "curl",
            "javascript"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:6120015748fd6b0042985409"
}
```

---

# Query a database

Gets a list of Pages and/or Databases contained in the database, filtered and ordered according to the filter conditions and sort criteria provided in the request. The response may contain fewer than page_size of results. If the response includes a next_cursor value, refer to the pagination referenc...

Gets a list of [Pages](ref:page) and/or [Databases](https://developers.notion.com/reference/database) contained in the database, filtered and ordered according to the filter conditions and sort criteria provided in the request. The response may contain fewer than `page_size` of results. If the response includes a `next_cursor` value, refer to the [pagination reference](https://developers.notion.com/reference/intro#pagination) for details about how to use a cursor to iterate through the list.

> 📘
>
> [Wiki](https://www.notion.so/help/wikis-and-verified-pages) databases can contain both pages and databases as children.

[**Filters**](ref:post-database-query-filter) are similar to the [filters provided in the Notion UI](https://www.notion.so/help/views-filters-and-sorts) where the set of filters and filter groups chained by "And" in the UI is equivalent to having each filter in the array of the compound `"and"` filter. Similar a set of filters chained by "Or" in the UI would be represented as filters in the array of the `"or"` compound filter.
Filters operate on database properties and can be combined. If no filter is provided, all the pages in the database will be returned with pagination.

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/6fe4a44-Screen_Shot_2021-12-23_at_11.46.21_AM.png",
        "Screen Shot 2021-12-23 at 11.46.21 AM.png",
        1340
      ],
      "align": "center",
      "caption": "The above filters in the UI can be represented as the following filter object"
    }
  ]
}
[/block]


```json Filter Object
{
  "and": [
    {
      "property": "Done",
      "checkbox": {
        "equals": true
      }
    },
    {
      "or": [
        {
          "property": "Tags",
          "contains": "A"
        },
        {
          "property": "Tags",
          "contains": "B"
        }
      ]
  	}
  ]
}
```

In addition to chained filters, databases can be queried with single filters.

```json
{
    "property": "Done",
    "checkbox": {
        "equals": true
   }
 }
```

[**Sorts**](ref:post-database-query-sort) are similar to the [sorts provided in the Notion UI](https://notion.so/notion/Intro-to-databases-fd8cd2d212f74c50954c11086d85997e#0eb303043b1742468e5aff2f3f670505). Sorts operate on database properties or page timestamps and can be combined. The order of the sorts in the request matter, with earlier sorts taking precedence over later ones.

The properties of the database schema returned in the response body can be filtered with the `filter_properties` query parameter.

```
https://api.notion.com/v1/databases/[database_id]/query?filter_properties=[property_id_1]
```

Multiple filter properties can be provided by chaining the `filter_properties` query param.

```
https://api.notion.com/v1/databases/[database_id]/query?filter_properties=[property_id_1]&filter_properties=[property_id_2]
```

Property IDs can be determined with the [Retrieve a database](https://developers.notion.com/reference/retrieve-a-database) endpoint.

If you are using the [Notion JavaScript SDK](https://github.com/makenotion/notion-sdk-js), the `filter_properties` endpoint expects an array of property ID strings.

```javascript
notion.databases.query({
	database_id: id,
	filter_properties: ["propertyID1", "propertyID2"]
})
```

> 📘 Permissions
>
> Before an integration can query a database, the database must be shared with the integration. Attempting to query a database that has not been shared will return an HTTP response with a 404 status code.
>
> To share a database with an integration, click the ••• menu at the top right of a database page, scroll to `Add connections`, and use the search bar to find and select the integration from the dropdown list.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have read content capabilities. Attempting to call this API without read content capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

> 📘 To display the page titles of related pages rather than just the ID:
>
> 1. Add a rollup property to the database which uses a formula to get the related page's title. This works well if you have access to updating the database's schema.
>
> 2. Otherwise, [retrieve the individual related pages](https://developers.notion.com/reference/retrieve-a-page) using each page ID.

> 🚧 Formula and Rollup Limitation
>
> - If a formula depends on a page property that is a relation, and that relation has more than 25 references, only 25 will be evaluated as part of the formula.
> - Rollups and formulas that depend on multiple layers of relations may not return correct results.

### Errors

Returns a 404 HTTP response if the database doesn't exist, or if the integration doesn't have access to the database.

Returns a 400 or a 429 HTTP response if the request exceeds the [request limits](ref:request-limits).

_Note: Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information._

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/databases/{database_id}/query": {
      "post": {
        "summary": "Query a database",
        "description": "",
        "operationId": "post-database-query",
        "parameters": [
          {
            "name": "database_id",
            "in": "path",
            "description": "Identifier for a Notion database.",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "filter_properties",
            "in": "query",
            "description": "A list of page property value IDs associated with the database. Use this param to limit the response to a specific page property value or values for pages that meet the `filter` criteria.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "filter": {
                    "type": "string",
                    "description": "When supplied, limits which pages are returned based on the [filter conditions](ref:post-database-query-filter).",
                    "format": "json"
                  },
                  "sorts": {
                    "type": "array",
                    "description": "When supplied, orders the results based on the provided [sort criteria](ref:post-database-query-sort)."
                  },
                  "start_cursor": {
                    "type": "string",
                    "description": "When supplied, returns a page of results starting after the cursor provided. If not supplied, this endpoint will return the first page of results."
                  },
                  "page_size": {
                    "type": "integer",
                    "description": "The number of items from the full list desired in the response. Maximum: 100",
                    "default": 100,
                    "format": "int32"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"list\",\n  \"results\": [\n    {\n      \"object\": \"page\",\n      \"id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\",\n      \"created_time\": \"2022-03-01T19:05:00.000Z\",\n      \"last_edited_time\": \"2022-07-06T20:25:00.000Z\",\n      \"created_by\": {\n        \"object\": \"user\",\n        \"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n      },\n      \"last_edited_by\": {\n        \"object\": \"user\",\n        \"id\": \"0c3e9826-b8f7-4f73-927d-2caaf86f1103\"\n      },\n      \"cover\": {\n        \"type\": \"external\",\n        \"external\": {\n          \"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n        }\n      },\n      \"icon\": {\n        \"type\": \"emoji\",\n        \"emoji\": \"🥬\"\n      },\n      \"parent\": {\n        \"type\": \"database_id\",\n        \"database_id\": \"d9824bdc-8445-4327-be8b-5b47500af6ce\"\n      },\n      \"archived\": false,\n      \"properties\": {\n        \"Store availability\": {\n          \"id\": \"%3AUPp\",\n          \"type\": \"multi_select\",\n          \"multi_select\": [\n            {\n              \"id\": \"t|O@\",\n              \"name\": \"Gus's Community Market\",\n              \"color\": \"yellow\"\n            },\n            {\n              \"id\": \"{Ml\\\\\",\n              \"name\": \"Rainbow Grocery\",\n              \"color\": \"gray\"\n            }\n          ]\n        },\n        \"Food group\": {\n          \"id\": \"A%40Hk\",\n          \"type\": \"select\",\n          \"select\": {\n            \"id\": \"5e8e7e8f-432e-4d8a-8166-1821e10225fc\",\n            \"name\": \"🥬 Vegetable\",\n            \"color\": \"pink\"\n          }\n        },\n        \"Price\": {\n          \"id\": \"BJXS\",\n          \"type\": \"number\",\n          \"number\": 2.5\n        },\n        \"Responsible Person\": {\n          \"id\": \"Iowm\",\n          \"type\": \"people\",\n          \"people\": [\n            {\n              \"object\": \"user\",\n              \"id\": \"cbfe3c6e-71cf-4cd3-b6e7-02f38f371bcc\",\n              \"name\": \"Cristina Cordova\",\n              \"avatar_url\": \"https://lh6.googleusercontent.com/-rapvfCoTq5A/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nDKmmUpkpFvWNBzvu9rnZEy7cbl8Q/photo.jpg\",\n              \"type\": \"person\",\n              \"person\": {\n                \"email\": \"cristina@makenotion.com\"\n              }\n            }\n          ]\n        },\n        \"Last ordered\": {\n          \"id\": \"Jsfb\",\n          \"type\": \"date\",\n          \"date\": {\n            \"start\": \"2022-02-22\",\n            \"end\": null,\n            \"time_zone\": null\n          }\n        },\n        \"Cost of next trip\": {\n          \"id\": \"WOd%3B\",\n          \"type\": \"formula\",\n          \"formula\": {\n            \"type\": \"number\",\n            \"number\": 0\n          }\n        },\n        \"Recipes\": {\n          \"id\": \"YfIu\",\n          \"type\": \"relation\",\n          \"relation\": [\n            {\n              \"id\": \"90eeeed8-2cdd-4af4-9cc1-3d24aff5f63c\"\n            },\n            {\n              \"id\": \"a2da43ee-d43c-4285-8ae2-6d811f12629a\"\n            }\n          ],\n\t\t\t\t\t\"has_more\": false\n        },\n        \"Description\": {\n          \"id\": \"_Tc_\",\n          \"type\": \"rich_text\",\n          \"rich_text\": [\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"A dark \",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \"A dark \",\n              \"href\": null\n            },\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"green\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"green\"\n              },\n              \"plain_text\": \"green\",\n              \"href\": null\n            },\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \" leafy vegetable\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \" leafy vegetable\",\n              \"href\": null\n            }\n          ]\n        },\n        \"In stock\": {\n          \"id\": \"%60%5Bq%3F\",\n          \"type\": \"checkbox\",\n          \"checkbox\": true\n        },\n        \"Number of meals\": {\n          \"id\": \"zag~\",\n          \"type\": \"rollup\",\n          \"rollup\": {\n            \"type\": \"number\",\n            \"number\": 2,\n            \"function\": \"count\"\n          }\n        },\n        \"Photo\": {\n          \"id\": \"%7DF_L\",\n          \"type\": \"url\",\n          \"url\": \"https://i.insider.com/612fb23c9ef1e50018f93198?width=1136&format=jpeg\"\n        },\n        \"Name\": {\n          \"id\": \"title\",\n          \"type\": \"title\",\n          \"title\": [\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"Tuscan kale\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \"Tuscan kale\",\n              \"href\": null\n            }\n          ]\n        }\n      },\n      \"url\": \"https://www.notion.so/Tuscan-kale-598337872cf94fdf8782e53db20768a5\"\n    }\n  ],\n  \"next_cursor\": null,\n  \"has_more\": false,\n  \"type\": \"page_or_database\",\n\t\"page_or_database\": {}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "list"
                    },
                    "results": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "object": {
                            "type": "string",
                            "example": "page"
                          },
                          "id": {
                            "type": "string",
                            "example": "59833787-2cf9-4fdf-8782-e53db20768a5"
                          },
                          "created_time": {
                            "type": "string",
                            "example": "2022-03-01T19:05:00.000Z"
                          },
                          "last_edited_time": {
                            "type": "string",
                            "example": "2022-07-06T20:25:00.000Z"
                          },
                          "created_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                              }
                            }
                          },
                          "last_edited_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "0c3e9826-b8f7-4f73-927d-2caaf86f1103"
                              }
                            }
                          },
                          "cover": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "external"
                              },
                              "external": {
                                "type": "object",
                                "properties": {
                                  "url": {
                                    "type": "string",
                                    "example": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                                  }
                                }
                              }
                            }
                          },
                          "icon": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "emoji"
                              },
                              "emoji": {
                                "type": "string",
                                "example": "🥬"
                              }
                            }
                          },
                          "parent": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "database_id"
                              },
                              "database_id": {
                                "type": "string",
                                "example": "d9824bdc-8445-4327-be8b-5b47500af6ce"
                              }
                            }
                          },
                          "archived": {
                            "type": "boolean",
                            "example": false,
                            "default": true
                          },
                          "properties": {
                            "type": "object",
                            "properties": {
                              "Store availability": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "%3AUPp"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "multi_select"
                                  },
                                  "multi_select": {
                                    "type": "array",
                                    "items": {
                                      "type": "object",
                                      "properties": {
                                        "id": {
                                          "type": "string",
                                          "example": "t|O@"
                                        },
                                        "name": {
                                          "type": "string",
                                          "example": "Gus's Community Market"
                                        },
                                        "color": {
                                          "type": "string",
                                          "example": "yellow"
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "Food group": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "A%40Hk"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "select"
                                  },
                                  "select": {
                                    "type": "object",
                                    "properties": {
                                      "id": {
                                        "type": "string",
                                        "example": "5e8e7e8f-432e-4d8a-8166-1821e10225fc"
                                      },
                                      "name": {
                                        "type": "string",
                                        "example": "🥬 Vegetable"
                                      },
                                      "color": {
                                        "type": "string",
                                        "example": "pink"
                                      }
                                    }
                                  }
                                }
                              },
                              "Price": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "BJXS"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "number"
                                  },
                                  "number": {
                                    "type": "number",
                                    "example": 2.5,
                                    "default": 0
                                  }
                                }
                              },
                              "Responsible Person": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "Iowm"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "people"
                                  },
                                  "people": {
                                    "type": "array",
                                    "items": {
                                      "type": "object",
                                      "properties": {
                                        "object": {
                                          "type": "string",
                                          "example": "user"
                                        },
                                        "id": {
                                          "type": "string",
                                          "example": "cbfe3c6e-71cf-4cd3-b6e7-02f38f371bcc"
                                        },
                                        "name": {
                                          "type": "string",
                                          "example": "Cristina Cordova"
                                        },
                                        "avatar_url": {
                                          "type": "string",
                                          "example": "https://lh6.googleusercontent.com/-rapvfCoTq5A/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nDKmmUpkpFvWNBzvu9rnZEy7cbl8Q/photo.jpg"
                                        },
                                        "type": {
                                          "type": "string",
                                          "example": "person"
                                        },
                                        "person": {
                                          "type": "object",
                                          "properties": {
                                            "email": {
                                              "type": "string",
                                              "example": "cristina@makenotion.com"
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "Last ordered": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "Jsfb"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "date"
                                  },
                                  "date": {
                                    "type": "object",
                                    "properties": {
                                      "start": {
                                        "type": "string",
                                        "example": "2022-02-22"
                                      },
                                      "end": {},
                                      "time_zone": {}
                                    }
                                  }
                                }
                              },
                              "Cost of next trip": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "WOd%3B"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "formula"
                                  },
                                  "formula": {
                                    "type": "object",
                                    "properties": {
                                      "type": {
                                        "type": "string",
                                        "example": "number"
                                      },
                                      "number": {
                                        "type": "integer",
                                        "example": 0,
                                        "default": 0
                                      }
                                    }
                                  }
                                }
                              },
                              "Recipes": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "YfIu"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "relation"
                                  },
                                  "relation": {
                                    "type": "array",
                                    "items": {
                                      "type": "object",
                                      "properties": {
                                        "id": {
                                          "type": "string",
                                          "example": "90eeeed8-2cdd-4af4-9cc1-3d24aff5f63c"
                                        }
                                      }
                                    }
                                  },
                                  "has_more": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  }
                                }
                              },
                              "Description": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "_Tc_"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "rich_text"
                                  },
                                  "rich_text": {
                                    "type": "array",
                                    "items": {
                                      "type": "object",
                                      "properties": {
                                        "type": {
                                          "type": "string",
                                          "example": "text"
                                        },
                                        "text": {
                                          "type": "object",
                                          "properties": {
                                            "content": {
                                              "type": "string",
                                              "example": "A dark "
                                            },
                                            "link": {}
                                          }
                                        },
                                        "annotations": {
                                          "type": "object",
                                          "properties": {
                                            "bold": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "italic": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "strikethrough": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "underline": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "code": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "color": {
                                              "type": "string",
                                              "example": "default"
                                            }
                                          }
                                        },
                                        "plain_text": {
                                          "type": "string",
                                          "example": "A dark "
                                        },
                                        "href": {}
                                      }
                                    }
                                  }
                                }
                              },
                              "In stock": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "%60%5Bq%3F"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "checkbox"
                                  },
                                  "checkbox": {
                                    "type": "boolean",
                                    "example": true,
                                    "default": true
                                  }
                                }
                              },
                              "Number of meals": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "zag~"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "rollup"
                                  },
                                  "rollup": {
                                    "type": "object",
                                    "properties": {
                                      "type": {
                                        "type": "string",
                                        "example": "number"
                                      },
                                      "number": {
                                        "type": "integer",
                                        "example": 2,
                                        "default": 0
                                      },
                                      "function": {
                                        "type": "string",
                                        "example": "count"
                                      }
                                    }
                                  }
                                }
                              },
                              "Photo": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "%7DF_L"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "url"
                                  },
                                  "url": {
                                    "type": "string",
                                    "example": "https://i.insider.com/612fb23c9ef1e50018f93198?width=1136&format=jpeg"
                                  }
                                }
                              },
                              "Name": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "title"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "title"
                                  },
                                  "title": {
                                    "type": "array",
                                    "items": {
                                      "type": "object",
                                      "properties": {
                                        "type": {
                                          "type": "string",
                                          "example": "text"
                                        },
                                        "text": {
                                          "type": "object",
                                          "properties": {
                                            "content": {
                                              "type": "string",
                                              "example": "Tuscan kale"
                                            },
                                            "link": {}
                                          }
                                        },
                                        "annotations": {
                                          "type": "object",
                                          "properties": {
                                            "bold": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "italic": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "strikethrough": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "underline": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "code": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "color": {
                                              "type": "string",
                                              "example": "default"
                                            }
                                          }
                                        },
                                        "plain_text": {
                                          "type": "string",
                                          "example": "Tuscan kale"
                                        },
                                        "href": {}
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "url": {
                            "type": "string",
                            "example": "https://www.notion.so/Tuscan-kale-598337872cf94fdf8782e53db20768a5"
                          }
                        }
                      }
                    },
                    "next_cursor": {},
                    "has_more": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "page_or_database"
                    },
                    "page_or_database": {
                      "type": "object",
                      "properties": {}
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "curl",
              "code": "curl -X POST 'https://api.notion.com/v1/databases/897e5a76ae524b489fdfe71f5945d1af/query' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H 'Notion-Version: 2022-06-28' \\\n  -H \"Content-Type: application/json\" \\\n--data '{\n  \"filter\": {\n    \"or\": [\n      {\n        \"property\": \"In stock\",\n\"checkbox\": {\n\"equals\": true\n}\n      },\n      {\n\"property\": \"Cost of next trip\",\n\"number\": {\n\"greater_than_or_equal_to\": 2\n}\n}\n]\n},\n  \"sorts\": [\n    {\n      \"property\": \"Last ordered\",\n      \"direction\": \"ascending\"\n    }\n  ]\n}'"
            },
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const databaseId = 'd9824bdc-8445-4327-be8b-5b47500af6ce';\n  const response = await notion.databases.query({\n    database_id: databaseId,\n    filter: {\n      or: [\n        {\n          property: 'In stock',\n          checkbox: {\n            equals: true,\n          },\n        },\n        {\n          property: 'Cost of next trip',\n          number: {\n            greater_than_or_equal_to: 2,\n          },\n        },\n      ],\n    },\n    sorts: [\n      {\n        property: 'Last ordered',\n        direction: 'ascending',\n      },\n    ],\n  });\n  console.log(response);\n})();"
            }
          ],
          "samples-languages": [
            "curl",
            "javascript"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:609176570b6bf20019821ce5"
}
```

---

# Filter database entries

When you query a database , you can send a filter object in the body of the request that limits the returned entries based on the specified criteria. For example, the below query limits the response to entries where the "Task completed" checkbox property value is true : curl -X POST 'https://api.not...

When you [query a database](https://developers.notion.com/reference/post-database-query), you can send a `filter` object in the body of the request that limits the returned entries based on the specified criteria.

For example, the below query limits the response to entries where the `"Task completed"`  `checkbox` property value is `true`:

```curl
curl -X POST 'https://api.notion.com/v1/databases/897e5a76ae524b489fdfe71f5945d1af/query' \
  -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
  -H 'Notion-Version: 2022-06-28' \
  -H "Content-Type: application/json" \
--data '{
  "filter": {
    "property": "Task completed",
    "checkbox": {
        "equals": true
   }
  }
}'
```

Here is the same query using the [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js):

```javascript
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
// replace with your own database ID
const databaseId = 'd9824bdc-8445-4327-be8b-5b47500af6ce';

const filteredRows = async () => {
	const response = await notion.databases.query({
	  database_id: databaseId,
	  filter: {
	    property: "Task completed",
	    checkbox: {
	      equals: true
	    }
	  },
	});
  return response;
}

```

Filters can be chained with the `and` and `or` keys so that multiple filters are applied at the same time. (See [Query a database](https://developers.notion.com/reference/post-database-query) for additional examples.)

```json
{
  "and": [
    {
      "property": "Done",
      "checkbox": {
        "equals": true
      }
    },
    {
      "or": [
        {
          "property": "Tags",
          "contains": "A"
        },
        {
          "property": "Tags",
          "contains": "B"
        }
      ]
    }
  ]
}
```

If no filter is provided, all the pages in the database will be returned with pagination.

## The filter object

Each `filter` object contains the following fields:

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`property`",
    "0-1": "`string`",
    "0-2": "The name of the property as it appears in the database, or the property ID.",
    "0-3": "`\"Task completed\"`",
    "1-0": "`checkbox`  \n`date`  \n`files`  \n`formula`  \n`multi_select`  \n`number`  \n`people`  \n`phone_number`  \n`relation`  \n`rich_text`  \n`select`  \n`status`  \n`timestamp`  \n`ID`",
    "1-1": "`object`",
    "1-2": "The type-specific filter condition for the query. Only types listed in the Field column of this table are supported.  \n  \nRefer to [type-specific filter conditions](#type-specific-filter-conditions) for details on corresponding object values.",
    "1-3": "`\"checkbox\": {\n  \"equals\": true\n}`"
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


```json Example checkbox filter object
{
  "filter": {
    "property": "Task completed",
    "checkbox": {
      "equals": true
    }
  }
}
```

> 👍
>
> The filter object mimics the database [filter option in the Notion UI](https://www.notion.so/help/views-filters-and-sorts).

## Type-specific filter conditions

### Checkbox

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`equals`",
    "0-1": "`boolean`",
    "0-2": "Whether a `checkbox` property value matches the provided value exactly.  \n  \nReturns or excludes all database entries with an exact value match.",
    "0-3": "`false`",
    "1-0": "`does_not_equal`",
    "1-1": "`boolean`",
    "1-2": "Whether a `checkbox` property value differs from the provided value.  \n  \nReturns or excludes all database entries with a difference in values.",
    "1-3": "`true`"
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


```json Example checkbox filter condition
{
  "filter": {
    "property": "Task completed",
    "checkbox": {
      "does_not_equal": true
    }
  }
}
```

### Date

> 📘
>
> For the `after`, `before`, `equals, on_or_before`, and `on_or_after` fields, if a date string with a time is provided, then the comparison is done with millisecond precision.
>
> If no timezone is provided, then the timezone defaults to UTC.

A date filter condition can be used to limit `date` property value types and the [timestamp](#timestamp) property types `created_time` and `last_edited_time`.

The condition contains the below fields:

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`after`",
    "0-1": "`string` ([ISO 8601 date](https://en.wikipedia.org/wiki/ISO_8601))",
    "0-2": "The value to compare the date property value against.  \n  \nReturns database entries where the date property value is after the provided date.",
    "0-3": "`\"2021-05-10\"`  \n  \n`\"2021-05-10T12:00:00\"`  \n  \n`\"2021-10-15T12:00:00-07:00\"`",
    "1-0": "`before`",
    "1-1": "`string` ([ISO 8601 date](https://en.wikipedia.org/wiki/ISO_8601))",
    "1-2": "The value to compare the date property value against.  \n  \nReturns database entries where the date property value is before the provided date.",
    "1-3": "`\"2021-05-10\"`  \n  \n`\"2021-05-10T12:00:00\"`  \n  \n`\"2021-10-15T12:00:00-07:00\"`",
    "2-0": "`equals`",
    "2-1": "`string` ([ISO 8601 date](https://en.wikipedia.org/wiki/ISO_8601))",
    "2-2": "The value to compare the date property value against.  \n  \nReturns database entries where the date property value is the provided date.",
    "2-3": "`\"2021-05-10\"`  \n  \n`\"2021-05-10T12:00:00\"`  \n  \n`\"2021-10-15T12:00:00-07:00\"`",
    "3-0": "`is_empty`",
    "3-1": "`true`",
    "3-2": "The value to compare the date property value against.  \n  \nReturns database entries where the date property value contains no data.",
    "3-3": "`true`",
    "4-0": "`is_not_empty`",
    "4-1": "`true`",
    "4-2": "The value to compare the date property value against.  \n  \nReturns database entries where the date property value is not empty.",
    "4-3": "`true`",
    "5-0": "`next_month`",
    "5-1": "`object` (empty)",
    "5-2": "A filter that limits the results to database entries where the date property value is within the next month.",
    "5-3": "`{}`",
    "6-0": "`next_week`",
    "6-1": "`object` (empty)",
    "6-2": "A filter that limits the results to database entries where the date property value is within the next week.",
    "6-3": "`{}`",
    "7-0": "`next_year`",
    "7-1": "`object` (empty)",
    "7-2": "A filter that limits the results to database entries where the date property value is within the next year.",
    "7-3": "`{}`",
    "8-0": "`on_or_after`",
    "8-1": "`string` ([ISO 8601 date](https://en.wikipedia.org/wiki/ISO_8601))",
    "8-2": "The value to compare the date property value against.  \n  \nReturns database entries where the date property value is on or after the provided date.",
    "8-3": "`\"2021-05-10\"`  \n  \n`\"2021-05-10T12:00:00\"`  \n  \n`\"2021-10-15T12:00:00-07:00\"`",
    "9-0": "`on_or_before`",
    "9-1": "`string` ([ISO 8601 date](https://en.wikipedia.org/wiki/ISO_8601))",
    "9-2": "The value to compare the date property value against.  \n  \nReturns database entries where the date property value is on or before the provided date.",
    "9-3": "`\"2021-05-10\"`  \n  \n`\"2021-05-10T12:00:00\"`  \n  \n`\"2021-10-15T12:00:00-07:00\"`",
    "10-0": "`past_month`",
    "10-1": "`object` (empty)",
    "10-2": "A filter that limits the results to database entries where the `date` property value is within the past month.",
    "10-3": "`{}`",
    "11-0": "`past_week`",
    "11-1": "`object` (empty)",
    "11-2": "A filter that limits the results to database entries where the `date` property value is within the past week.",
    "11-3": "`{}`",
    "12-0": "`past_year`",
    "12-1": "`object` (empty)",
    "12-2": "A filter that limits the results to database entries where the `date` property value is within the past year.",
    "12-3": "`{}`",
    "13-0": "`this_week`",
    "13-1": "`object` (empty)",
    "13-2": "A filter that limits the results to database entries where the `date` property value is this week.",
    "13-3": "`{}`"
  },
  "cols": 4,
  "rows": 14,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example date filter condition
{
  "filter": {
    "property": "Due date",
    "date": {
      "on_or_after": "2023-02-08"
    }
  }
}
```

### Files

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`is_empty`",
    "0-1": "`true`",
    "0-2": "Whether the files property value does not contain any data.  \n  \nReturns all database entries with an empty `files` property value.",
    "0-3": "`true`",
    "1-0": "`is_not_empty`",
    "1-1": "`true`",
    "1-2": "Whether the `files` property value contains data.  \n  \nReturns all entries with a populated `files` property value.",
    "1-3": "`true`"
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


```json Example files filter condition
{
  "filter": {
    "property": "Blueprint",
    "files": {
      "is_not_empty": true
    }
  }
}
```

### Formula

The primary field of the `formula` filter condition object matches the type of the formula’s result. For example, to filter a formula property that computes a `checkbox`, use a `formula` filter condition object with a `checkbox` field containing a checkbox filter condition as its value.

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`checkbox`",
    "0-1": "`object`",
    "0-2": "A [checkbox](#checkbox) filter condition to compare the formula result against.  \n  \nReturns database entries where the formula result matches the provided condition.",
    "0-3": "Refer to the [checkbox](#checkbox) filter condition.",
    "1-0": "`date`",
    "1-1": "`object`",
    "1-2": "A [date](#date) filter condition to compare the formula result against.  \n  \nReturns database entries where the formula result matches the provided condition.",
    "1-3": "Refer to the [date](#date) filter condition.",
    "2-0": "`number`",
    "2-1": "`object`",
    "2-2": "A [number](#number) filter condition to compare the formula result against.  \n  \nReturns database entries where the formula result matches the provided condition.",
    "2-3": "Refer to the [number](#number) filter condition.",
    "3-0": "`string`",
    "3-1": "`object`",
    "3-2": "A [rich text](#rich-text) filter condition to compare the formula result against.  \n  \nReturns database entries where the formula result matches the provided condition.",
    "3-3": "Refer to the [rich text](#rich-text) filter condition."
  },
  "cols": 4,
  "rows": 4,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example formula filter condition
{
  "filter": {
    "property": "One month deadline",
    "formula": {
      "date":{
          "after": "2021-05-10"
      }
    }
  }
}
```

### Multi-select

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`contains`",
    "0-1": "`string`",
    "0-2": "The value to compare the multi-select property value against.  \n  \nReturns database entries where the multi-select value matches the provided string.",
    "0-3": "`\"Marketing\"`",
    "1-0": "`does_not_contain`",
    "1-1": "`string`",
    "1-2": "The value to compare the multi-select property value against.  \n  \nReturns database entries where the multi-select value does not match the provided string.",
    "1-3": "`\"Engineering\"`",
    "2-0": "`is_empty`",
    "2-1": "`true`",
    "2-2": "Whether the multi-select property value is empty.  \n  \nReturns database entries where the multi-select value does not contain any data.",
    "2-3": "`true`",
    "3-0": "`is_not_empty`",
    "3-1": "`true`",
    "3-2": "Whether the multi-select property value is not empty.  \n  \nReturns database entries where the multi-select value does contains data.",
    "3-3": "`true`"
  },
  "cols": 4,
  "rows": 4,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example multi-select filter condition
{
  "filter": {
    "property": "Programming language",
    "multi_select": {
      "contains": "TypeScript"
    }
  }
}
```

### Number

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`does_not_equal`",
    "0-1": "`number`",
    "0-2": "The `number` to compare the number property value against.  \n  \nReturns database entries where the number property value differs from the provided `number`.",
    "0-3": "`42`",
    "1-0": "`equals`",
    "1-1": "`number`",
    "1-2": "The `number` to compare the number property value against.  \n  \nReturns database entries where the number property value is the same as the provided number.",
    "1-3": "`42`",
    "2-0": "`greater_than`",
    "2-1": "`number`",
    "2-2": "The `number` to compare the number property value against.  \n  \nReturns database entries where the number property value exceeds the provided `number`.",
    "2-3": "`42`",
    "3-0": "`greater_than_or_equal_to`",
    "3-1": "`number`",
    "3-2": "The `number` to compare the number property value against.  \n  \nReturns database entries where the number property value is equal to or exceeds the provided `number`.",
    "3-3": "`42`",
    "4-0": "`is_empty`",
    "4-1": "`true`",
    "4-2": "Whether the `number` property value is empty.  \n  \nReturns database entries where the number property value does not contain any data.",
    "4-3": "`true`",
    "5-0": "`is_not_empty`",
    "5-1": "`true`",
    "5-2": "Whether the number property value is not empty.  \n  \nReturns database entries where the number property value contains data.",
    "5-3": "`true`",
    "6-0": "`less_than`",
    "6-1": "`number`",
    "6-2": "The `number` to compare the number property value against.  \n  \nReturns database entries where the number property value is less than the provided `number`.",
    "6-3": "`42`",
    "7-0": "`less_than_or_equal_to`",
    "7-1": "`number`",
    "7-2": "The `number` to compare the number property value against.  \n  \nReturns database entries where the number property value is equal to or is less than the provided `number`.",
    "7-3": "`42`"
  },
  "cols": 4,
  "rows": 8,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example number filter condition
{
  "filter": {
    "property": "Estimated working days",
    "number": {
      "less_than_or_equal_to": 5
    }
  }
}
```

### People

You can apply a people filter condition to `people`, `created_by`, and `last_edited_by` database property types.

The people filter condition contains the following fields:

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`contains`",
    "0-1": "`string` (UUIDv4)",
    "0-2": "The value to compare the people property value against.  \n  \nReturns database entries where the people property value contains the provided `string`.",
    "0-3": "`\"6c574cee-ca68-41c8-86e0-1b9e992689fb\"`",
    "1-0": "`does_not_contain`",
    "1-1": "`string` (UUIDv4)",
    "1-2": "The value to compare the people property value against.  \n  \nReturns database entries where the people property value does not contain the provided `string`.",
    "1-3": "`\"6c574cee-ca68-41c8-86e0-1b9e992689fb\"`",
    "2-0": "`is_empty`",
    "2-1": "`true`",
    "2-2": "Whether the people property value does not contain any data.  \n  \nReturns database entries where the people property value does not contain any data.",
    "2-3": "`true`",
    "3-0": "`is_not_empty`",
    "3-1": "`true`",
    "3-2": "Whether the people property value contains data.  \n  \nReturns database entries where the people property value is not empty.",
    "3-3": "`true`"
  },
  "cols": 4,
  "rows": 4,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example people filter condition
{
  "filter": {
    "property": "Last edited by",
    "people": {
      "contains": "c2f20311-9e54-4d11-8c79-7398424ae41e"
    }
  }
}
```

### Relation

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`contains`",
    "0-1": "`string` (UUIDv4)",
    "0-2": "The value to compare the relation property value against.  \n  \nReturns database entries where the relation property value contains the provided `string`.",
    "0-3": "`\"6c574cee-ca68-41c8-86e0-1b9e992689fb\"`",
    "1-0": "`does_not_contain`",
    "1-1": "`string` (UUIDv4)",
    "1-2": "The value to compare the relation property value against.  \n  \nReturns entries where the relation property value does not contain the provided `string`.",
    "1-3": "`\"6c574cee-ca68-41c8-86e0-1b9e992689fb\"`",
    "2-0": "`is_empty`",
    "2-1": "`true`",
    "2-2": "Whether the relation property value does not contain data.  \n  \nReturns database entries where the relation property value does not contain any data.",
    "2-3": "`true`",
    "3-0": "`is_not_empty`",
    "3-1": "`true`",
    "3-2": "Whether the relation property value contains data.  \n  \nReturns database entries where the property value is not empty.",
    "3-3": "`true`"
  },
  "cols": 4,
  "rows": 4,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example relation filter condition
{
  "filter": {
    "property": "✔️ Task List",
    "relation": {
      "contains": "0c1f7cb280904f18924ed92965055e32"
    }
  }
}
```

### Rich text

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`contains`",
    "0-1": "`string`",
    "0-2": "The `string` to compare the text property value against.  \n  \nReturns database entries with a text property value that includes the provided `string`.",
    "0-3": "`\"Moved to Q2\"`",
    "1-0": "`does_not_contain`",
    "1-1": "`string`",
    "1-2": "The `string` to compare the text property value against.  \n  \nReturns database entries with a text property value that does not include the provided `string`.",
    "1-3": "`\"Moved to Q2\"`",
    "2-0": "`does_not_equal`",
    "2-1": "`string`",
    "2-2": "The `string` to compare the text property value against.  \n  \nReturns database entries with a text property value that does not match the provided `string`.",
    "2-3": "`\"Moved to Q2\"`",
    "3-0": "`ends_with`",
    "3-1": "`string`",
    "3-2": "The `string` to compare the text property value against.  \n  \nReturns database entries with a text property value that ends with the provided `string`.",
    "3-3": "`\"Q2\"`",
    "4-0": "`equals`",
    "4-1": "`string`",
    "4-2": "The `string` to compare the text property value against.  \n  \nReturns database entries with a text property value that matches the provided `string`.",
    "4-3": "`\"Moved to Q2\"`",
    "5-0": "`is_empty`",
    "5-1": "`true`",
    "5-2": "Whether the text property value does not contain any data.  \n  \nReturns database entries with a text property value that is empty.",
    "5-3": "`true`",
    "6-0": "`is_not_empty`",
    "6-1": "`true`",
    "6-2": "Whether the text property value contains any data.  \n  \nReturns database entries with a text property value that contains data.",
    "6-3": "`true`",
    "7-0": "`starts_with`",
    "7-1": "`string`",
    "7-2": "The `string` to compare the text property value against.  \n  \nReturns database entries with a text property value that starts with the provided `string`.",
    "7-3": "\"Moved\""
  },
  "cols": 4,
  "rows": 8,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example rich text filter condition
{
  "filter": {
    "property": "Description",
    "rich_text": {
      "contains": "cross-team"
    }
  }
}
```

### Rollup

A rollup database property can evaluate to an array, date, or number value. The filter condition for the rollup property contains a `rollup` key and a corresponding object value that depends on the computed value type.

#### Filter conditions for `array` rollup values

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`any`",
    "0-1": "`object`",
    "0-2": "The value to compare each rollup property value against. Can be a [filter condition](#type-specific-filter-conditions) for any other type.  \n  \nReturns database entries where the rollup property value matches the provided criteria.",
    "0-3": "`\"rich_text\": {\n\"contains\": \"Take Fig on a walk\"\n}`",
    "1-0": "`every`",
    "1-1": "`object`",
    "1-2": "The value to compare each rollup property value against. Can be a [filter condition](#type-specific-filter-conditions) for any other type.  \n  \nReturns database entries where every rollup property value matches the provided criteria.",
    "1-3": "`\"rich_text\": {\n\"contains\": \"Take Fig on a walk\"\n}`",
    "2-0": "`none`",
    "2-1": "`object`",
    "2-2": "The value to compare each rollup property value against. Can be a [filter condition](#type-specific-filter-conditions) for any other type.  \n  \nReturns database entries where no rollup property value matches the provided criteria.",
    "2-3": "`\"rich_text\": {\n\"contains\": \"Take Fig on a walk\"\n}`"
  },
  "cols": 4,
  "rows": 3,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example array rollup filter condition
{
  "filter": {
    "property": "Related tasks",
    "rollup": {
      "any": {
        "rich_text": {
          "contains": "Migrate database"
        }
      }
    }
  }
}
```

#### Filter conditions for `date` rollup values

A rollup value is stored as a `date` only if the "Earliest date", "Latest date", or "Date range" computation is selected for the property in the Notion UI.

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`date`",
    "0-1": "`object`",
    "0-2": "A [date](#date) filter condition to compare the rollup value against.  \n  \nReturns database entries where the rollup value matches the provided condition.",
    "0-3": "Refer to the [date](#date) filter condition."
  },
  "cols": 4,
  "rows": 1,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example date rollup filter condition
{
  "filter": {
    "property": "Parent project due date",
    "rollup": {
      "date": {
        "on_or_before": "2023-02-08"
      }
    }
  }
}
```

#### Filter conditions for `number` rollup values

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`number`",
    "0-1": "`object`",
    "0-2": "A [number](#number) filter condition to compare the rollup value against.  \n  \nReturns database entries where the rollup value matches the provided condition.",
    "0-3": "Refer to the [number](#number) filter condition."
  },
  "cols": 4,
  "rows": 1,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example number rollup filter condition
{
  "filter": {
    "property": "Total estimated working days",
    "rollup": {
      "number": {
        "does_not_equal": 42
      }
    }
  }
}
```

### Select

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`equals`",
    "0-1": "`string`",
    "0-2": "The `string` to compare the select property value against.  \n  \nReturns database entries where the select property value matches the provided string.",
    "0-3": "`\"This week\"`",
    "1-0": "`does_not_equal`",
    "1-1": "`string`",
    "1-2": "The `string` to compare the select property value against.  \n  \nReturns database entries where the select property value does not match the provided `string`.",
    "1-3": "`\"Backlog\"`",
    "2-0": "`is_empty`",
    "2-1": "`true`",
    "2-2": "Whether the select property value does not contain data.  \n  \nReturns database entries where the select property value is empty.",
    "2-3": "`true`",
    "3-0": "`is_not_empty`",
    "3-1": "`true`",
    "3-2": "Whether the select property value contains data.  \n  \nReturns database entries where the select property value is not empty.",
    "3-3": "`true`"
  },
  "cols": 4,
  "rows": 4,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example select filter condition
{
  "filter": {
    "property": "Frontend framework",
    "select": {
      "equals": "React"
    }
  }
}
```

### Status

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "equals",
    "0-1": "string",
    "0-2": "The string to compare the status property value against.  \n  \nReturns database entries where the status property value matches the provided string.",
    "0-3": "\"This week\"",
    "1-0": "does_not_equal",
    "1-1": "string",
    "1-2": "The string to compare the status property value against.  \n  \nReturns database entries where the status property value does not match the provided string.",
    "1-3": "\"Backlog\"",
    "2-0": "is_empty",
    "2-1": "true",
    "2-2": "Whether the status property value does not contain data.  \n  \nReturns database entries where the status property value is empty.",
    "2-3": "true",
    "3-0": "is_not_empty",
    "3-1": "true",
    "3-2": "Whether the status property value contains data.  \n  \nReturns database entries where the status property value is not empty.",
    "3-3": "true"
  },
  "cols": 4,
  "rows": 4,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example status filter condition
{
  "filter": {
    "property": "Project status",
    "status": {
      "equals": "Not started"
    }
  }
}
```

### Timestamp

Use a timestamp filter condition to filter results based on `created_time` or `last_edited_time` values.

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "timestamp",
    "0-1": "created_time last_edited_time",
    "0-2": "A constant string representing the type of timestamp to use as a filter.",
    "0-3": "\"created_time\"",
    "1-0": "created_time  \nlast_edited_time",
    "1-1": "object",
    "1-2": "A date filter condition used to filter the specified timestamp.",
    "1-3": "Refer to the [date](#date) filter condition."
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


```json Example timestamp filter condition for created_time
{
  "filter": {
    "timestamp": "created_time",
    "created_time": {
      "on_or_before": "2022-10-13"
    }
  }
}
```

> 🚧
>
> The `timestamp` filter condition does not require a property name. The API throws an error if you provide one.

### ID

Use a timestamp filter condition to filter results based on the `unique_id` value.

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`does_not_equal`",
    "0-1": "`number`",
    "0-2": "The value to compare the unique_id property value against.  \n  \nReturns database entries where the unique_id property value differs from the provided value.",
    "0-3": "`42`",
    "1-0": "`equals`",
    "1-1": "`number`",
    "1-2": "The value to compare the unique_id property value against.  \n  \nReturns database entries where the unique_id property value is the same as the provided value.",
    "1-3": "`42`",
    "2-0": "`greater_than`",
    "2-1": "`number`",
    "2-2": "The value to compare the unique_id property value against.  \n  \nReturns database entries where the unique_id property value exceeds the provided value.",
    "2-3": "`42`",
    "3-0": "`greater_than_or_equal_to`",
    "3-1": "`number`",
    "3-2": "The value to compare the unique_id property value against.  \n  \nReturns database entries where the unique_id property value is equal to or exceeds the provided value.",
    "3-3": "`42`",
    "4-0": "`less_than`",
    "4-1": "`number`",
    "4-2": "The value to compare the unique_id property value against.  \n  \nReturns database entries where the unique_id property value is less than the provided value.",
    "4-3": "`42`",
    "5-0": "`less_than_or_equal_to`",
    "5-1": "`number`",
    "5-2": "The value to compare the unique_id property value against.  \n  \nReturns database entries where the unique_id property value is equal to or is less than the provided value.",
    "5-3": "`42`"
  },
  "cols": 4,
  "rows": 6,
  "align": [
    "left",
    "left",
    "left",
    "left"
  ]
}
[/block]


```json Example ID filter condition
{
  "filter": {
    "and": [
      {
        "property": "ID",
        "unique_id": {
          "greater_than": 1
        }
      },
      {
        "property": "ID",
        "unique_id": {
          "less_than": 3
        }
      }
    ]
  }
}
```

## Compound filter conditions

You can use a compound filter condition to limit the results of a database query based on multiple conditions. This mimics filter chaining in the Notion UI.

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/14ec7e8-Untitled.png",
        "Untitled.png",
        1340
      ],
      "align": "center",
      "caption": "An example filter chain in the Notion UI"
    }
  ]
}
[/block]


The above filters in the Notion UI are equivalent to the following compound filter condition via the API:

```json
{
  "and": [
    {
      "property": "Done",
      "checkbox": {
        "equals": true
      }
    },
    {
      "or": [
        {
          "property": "Tags",
          "contains": "A"
        },
        {
          "property": "Tags",
          "contains": "B"
        }
      ]
    }
  ]
}
```

A compound filter condition contains an `and` or `or` key with a value that is an array of filter objects or nested compound filter objects. Nesting is supported up to two levels deep.

[block:parameters]
{
  "data": {
    "h-0": "Field",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`and`",
    "0-1": "`array`",
    "0-2": "An array of [filter](#type-specific-filter-conditions) objects or compound filter conditions.  \n  \nReturns database entries that match **all** of the provided filter conditions.",
    "0-3": "Refer to the examples below.",
    "1-0": "or",
    "1-1": "array",
    "1-2": "An array of [filter](#type-specific-filter-conditions) objects or compound filter conditions.  \n  \nReturns database entries that match **any** of the provided filter conditions",
    "1-3": "Refer to the examples below."
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


### Example compound filter conditions

```json Example compound filter condition for a checkbox and number property value
{
  "filter": {
    "and": [
      {
        "property": "Complete",
        "checkbox": {
          "equals": true
        }
      },
      {
        "property": "Working days",
        "number": {
          "greater_than": 10
        }
      }
    ]
  }
}
```

```json Example nested filter condition
{
  "filter": {
    "or": [
      {
        "property": "Description",
        "rich_text": {
          "contains": "2023"
        }
      },
      {
        "and": [
          {
            "property": "Department",
            "select": {
              "equals": "Engineering"
            }
          },
          {
            "property": "Priority goal",
            "checkbox": {
              "equals": true
            }
          }
        ]
      }
    ]
  }
}
```

---

# Sort database entries

A sort is a condition used to order the entries returned from a database query. A database query can be sorted by a property and/or timestamp and in a given direction. For example, a library database can be sorted by the "Name of a book" (i.e. property) and in ascending (i.e. direction). Here is an ...

A sort is a condition used to order the entries returned from a database query.

A [database query](ref:post-database-query) can be sorted by a property and/or timestamp and in a given direction. For example, a library database can be sorted by the "Name of a book" (i.e. property) and in `ascending` (i.e. direction).

Here is an example of a sort on a database property.

```json Sorting by "Name" property in ascending direction
{
    "sorts": [
        {
            "property": "Name",
            "direction": "ascending"
        }
    ]
}
```

If you’re using the [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js), you can apply this sorting property to your query like so:

```javascript
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
// replace with your own database ID
const databaseId = 'd9824bdc-8445-4327-be8b-5b47500af6ce';

const sortedRows = async () => {
	const response = await notion.databases.query({
	  database_id: databaseId,
	  sorts: [
	    {
	      property: "Name",
	      direction: "ascending"
		  }
	  ],
	});
  return response;
}
```

Database queries can also be sorted by two or more properties, which is formally called a nested sort. The sort object listed first in the nested sort list takes precedence.

Here is an example of a nested sort.

```json
{
    "sorts": [
                {
            "property": "Food group",
            "direction": "descending"
        },
        {
            "property": "Name",
            "direction": "ascending"
        }
    ]
}
```

In this example, the database query will first be sorted by "Food group" and the set with the same food group is then sorted by "Name".

## Sort object

### Property value sort

This sort orders the database query by a particular property.

The sort object must contain the following properties:

| Property    | Type            | Description                                                                      | Example value   |
| :---------- | :-------------- | :------------------------------------------------------------------------------- | :-------------- |
| `property`  | `string`        | The name of the property to sort against.                                        | `"Ingredients"` |
| `direction` | `string` (enum) | The direction to sort. Possible values include `"ascending"` and `"descending"`. | `"descending"`  |

### Entry timestamp sort

This sort orders the database query by the timestamp associated with a database entry.

The sort object must contain the following properties:

| Property    | Type            | Description                                                                                                   | Example value        |
| :---------- | :-------------- | :------------------------------------------------------------------------------------------------------------ | :------------------- |
| `timestamp` | `string` (enum) | The name of the timestamp to sort against. Possible values include `"created_time"` and `"last_edited_time"`. | `"last_edited_time"` |
| `direction` | `string` (enum) | The direction to sort. Possible values include `"ascending"` and `"descending"`.                              | `"descending"`       |

---

# Retrieve a database

Retrieves a database object — information that describes the structure and columns of a database — for a provided database ID. The response adheres to any limits to an integration’s capabilities. To fetch database rows rather than columns, use the Query a database endpoint. To find a database ID, na...

Retrieves a [database object](https://developers.notion.com/reference/database) — information that describes the structure and columns of a database — for a provided database ID. The response adheres to any limits to an integration’s capabilities.

To fetch database rows rather than columns, use the [Query a database](https://developers.notion.com/reference/post-database-query) endpoint.

To find a database ID, navigate to the database URL in your Notion workspace. The ID is the string of characters in the URL that is between the slash following the workspace name (if applicable) and the question mark. The ID is a 32 characters alphanumeric string.

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/64967fd-small-62e5027-notion_database_id.png",
        null,
        "Notion database ID"
      ],
      "align": "center",
      "caption": "Notion database ID"
    }
  ]
}
[/block]

Refer to the [Build your first integration guide](https://developers.notion.com/docs/create-a-notion-integration#step-3-save-the-database-id) for more details.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

### Additional resources

- [How to share a database with your integration](https://developers.notion.com/docs/create-a-notion-integration#give-your-integration-page-permissions)
- [Working with databases guide](https://developers.notion.com/docs/working-with-databases)

> 📘 Database relations must be shared with your integration
>
> To retrieve database properties from [database relations](https://www.notion.so/help/relations-and-rollups#what-is-a-database-relation), the related database must be shared with your integration in addition to the database being retrieved. If the related database is not shared, properties based on relations will not be included in the API response.

> 🚧 The Notion API does not support retrieving linked databases.
>
> To fetch the information in a [linked database](https://www.notion.so/help/guides/using-linked-databases), share the original source database with your Notion integration.

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/databases/{database_id}": {
      "get": {
        "summary": "Retrieve a database",
        "description": "",
        "operationId": "retrieve-a-database",
        "parameters": [
          {
            "name": "database_id",
            "in": "path",
            "description": "An identifier for the Notion database.",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"database\",\n    \"id\": \"bc1211ca-e3f1-4939-ae34-5260b16f627c\",\n    \"created_time\": \"2021-07-08T23:50:00.000Z\",\n    \"last_edited_time\": \"2021-07-08T23:50:00.000Z\",\n    \"icon\": {\n        \"type\": \"emoji\",\n        \"emoji\": \"🎉\"\n    },\n    \"cover\": {\n        \"type\": \"external\",\n        \"external\": {\n            \"url\": \"https://website.domain/images/image.png\"\n        }\n    },\n    \"url\": \"https://www.notion.so/bc1211cae3f14939ae34260b16f627c\",\n    \"title\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Grocery List\",\n                \"link\": null\n            },\n            \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n            },\n            \"plain_text\": \"Grocery List\",\n            \"href\": null\n        }\n    ],\n    \"description\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Grocery list for just kale 🥬\",\n                \"link\": null\n            },\n            \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n            },\n            \"plain_text\": \"Grocery list for just kale 🥬\",\n            \"href\": null\n        }\n    ],\n    \"properties\": {\n        \"+1\": {\n            \"id\": \"Wp%3DC\",\n            \"name\": \"+1\",\n            \"type\": \"people\",\n            \"people\": {}\n        },\n        \"In stock\": {\n            \"id\": \"fk%5EY\",\n            \"name\": \"In stock\",\n            \"type\": \"checkbox\",\n            \"checkbox\": {}\n        },\n        \"Price\": {\n            \"id\": \"evWq\",\n            \"name\": \"Price\",\n            \"type\": \"number\",\n            \"number\": {\n                \"format\": \"dollar\"\n            }\n        },\n        \"Description\": {\n            \"id\": \"V}lX\",\n            \"name\": \"Description\",\n            \"type\": \"rich_text\",\n            \"rich_text\": {}\n        },\n        \"Last ordered\": {\n            \"id\": \"eVnV\",\n            \"name\": \"Last ordered\",\n            \"type\": \"date\",\n            \"date\": {}\n        },\n        \"Meals\": {\n            \"id\": \"%7DWA~\",\n            \"name\": \"Meals\",\n            \"type\": \"relation\",\n            \"relation\": {\n                \"database_id\": \"668d797c-76fa-4934-9b05-ad288df2d136\",\n                \"synced_property_name\": \"Related to Grocery List (Meals)\"\n            }\n        },\n        \"Number of meals\": {\n            \"id\": \"Z\\\\Eh\",\n            \"name\": \"Number of meals\",\n            \"type\": \"rollup\",\n            \"rollup\": {\n                \"rollup_property_name\": \"Name\",\n                \"relation_property_name\": \"Meals\",\n                \"rollup_property_id\": \"title\",\n                \"relation_property_id\": \"mxp^\",\n                \"function\": \"count\"\n            }\n        },\n        \"Store availability\": {\n            \"id\": \"s}Kq\",\n            \"name\": \"Store availability\",\n            \"type\": \"multi_select\",\n            \"multi_select\": {\n                \"options\": [\n                    {\n                        \"id\": \"cb79b393-d1c1-4528-b517-c450859de766\",\n                        \"name\": \"Duc Loi Market\",\n                        \"color\": \"blue\"\n                    },\n                    {\n                        \"id\": \"58aae162-75d4-403b-a793-3bc7308e4cd2\",\n                        \"name\": \"Rainbow Grocery\",\n                        \"color\": \"gray\"\n                    },\n                    {\n                        \"id\": \"22d0f199-babc-44ff-bd80-a9eae3e3fcbf\",\n                        \"name\": \"Nijiya Market\",\n                        \"color\": \"purple\"\n                    },\n                    {\n                        \"id\": \"0d069987-ffb0-4347-bde2-8e4068003dbc\",\n                        \"name\": \"Gus's Community Market\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"Photo\": {\n            \"id\": \"yfiK\",\n            \"name\": \"Photo\",\n            \"type\": \"files\",\n            \"files\": {}\n        },\n        \"Food group\": {\n            \"id\": \"CM%3EH\",\n            \"name\": \"Food group\",\n            \"type\": \"select\",\n            \"select\": {\n                \"options\": [\n                    {\n                        \"id\": \"6d4523fa-88cb-4ffd-9364-1e39d0f4e566\",\n                        \"name\": \"🥦Vegetable\",\n                        \"color\": \"green\"\n                    },\n                    {\n                        \"id\": \"268d7e75-de8f-4c4b-8b9d-de0f97021833\",\n                        \"name\": \"🍎Fruit\",\n                        \"color\": \"red\"\n                    },\n                    {\n                        \"id\": \"1b234a00-dc97-489c-b987-829264cfdfef\",\n                        \"name\": \"💪Protein\",\n                        \"color\": \"yellow\"\n                    }\n                ]\n            }\n        },\n        \"Name\": {\n            \"id\": \"title\",\n            \"name\": \"Name\",\n            \"type\": \"title\",\n            \"title\": {}\n        }\n    },\n    \"parent\": {\n        \"type\": \"page_id\",\n        \"page_id\": \"98ad959b-2b6a-4774-80ee-00246fb0ea9b\"\n    },\n    \"archived\": false,\n    \"is_inline\": false,\n    \"public_url\": null\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "database"
                    },
                    "id": {
                      "type": "string",
                      "example": "bc1211ca-e3f1-4939-ae34-5260b16f627c"
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2021-07-08T23:50:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2021-07-08T23:50:00.000Z"
                    },
                    "icon": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "emoji"
                        },
                        "emoji": {
                          "type": "string",
                          "example": "🎉"
                        }
                      }
                    },
                    "cover": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "external"
                        },
                        "external": {
                          "type": "object",
                          "properties": {
                            "url": {
                              "type": "string",
                              "example": "https://website.domain/images/image.png"
                            }
                          }
                        }
                      }
                    },
                    "url": {
                      "type": "string",
                      "example": "https://www.notion.so/bc1211cae3f14939ae34260b16f627c"
                    },
                    "title": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "example": "text"
                          },
                          "text": {
                            "type": "object",
                            "properties": {
                              "content": {
                                "type": "string",
                                "example": "Grocery List"
                              },
                              "link": {}
                            }
                          },
                          "annotations": {
                            "type": "object",
                            "properties": {
                              "bold": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "italic": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "strikethrough": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "underline": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "code": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "color": {
                                "type": "string",
                                "example": "default"
                              }
                            }
                          },
                          "plain_text": {
                            "type": "string",
                            "example": "Grocery List"
                          },
                          "href": {}
                        }
                      }
                    },
                    "description": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "example": "text"
                          },
                          "text": {
                            "type": "object",
                            "properties": {
                              "content": {
                                "type": "string",
                                "example": "Grocery list for just kale 🥬"
                              },
                              "link": {}
                            }
                          },
                          "annotations": {
                            "type": "object",
                            "properties": {
                              "bold": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "italic": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "strikethrough": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "underline": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "code": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "color": {
                                "type": "string",
                                "example": "default"
                              }
                            }
                          },
                          "plain_text": {
                            "type": "string",
                            "example": "Grocery list for just kale 🥬"
                          },
                          "href": {}
                        }
                      }
                    },
                    "properties": {
                      "type": "object",
                      "properties": {
                        "+1": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Wp%3DC"
                            },
                            "name": {
                              "type": "string",
                              "example": "+1"
                            },
                            "type": {
                              "type": "string",
                              "example": "people"
                            },
                            "people": {
                              "type": "object",
                              "properties": {}
                            }
                          }
                        },
                        "In stock": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "fk%5EY"
                            },
                            "name": {
                              "type": "string",
                              "example": "In stock"
                            },
                            "type": {
                              "type": "string",
                              "example": "checkbox"
                            },
                            "checkbox": {
                              "type": "object",
                              "properties": {}
                            }
                          }
                        },
                        "Price": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "evWq"
                            },
                            "name": {
                              "type": "string",
                              "example": "Price"
                            },
                            "type": {
                              "type": "string",
                              "example": "number"
                            },
                            "number": {
                              "type": "object",
                              "properties": {
                                "format": {
                                  "type": "string",
                                  "example": "dollar"
                                }
                              }
                            }
                          }
                        },
                        "Description": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "V}lX"
                            },
                            "name": {
                              "type": "string",
                              "example": "Description"
                            },
                            "type": {
                              "type": "string",
                              "example": "rich_text"
                            },
                            "rich_text": {
                              "type": "object",
                              "properties": {}
                            }
                          }
                        },
                        "Last ordered": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "eVnV"
                            },
                            "name": {
                              "type": "string",
                              "example": "Last ordered"
                            },
                            "type": {
                              "type": "string",
                              "example": "date"
                            },
                            "date": {
                              "type": "object",
                              "properties": {}
                            }
                          }
                        },
                        "Meals": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "%7DWA~"
                            },
                            "name": {
                              "type": "string",
                              "example": "Meals"
                            },
                            "type": {
                              "type": "string",
                              "example": "relation"
                            },
                            "relation": {
                              "type": "object",
                              "properties": {
                                "database_id": {
                                  "type": "string",
                                  "example": "668d797c-76fa-4934-9b05-ad288df2d136"
                                },
                                "synced_property_name": {
                                  "type": "string",
                                  "example": "Related to Grocery List (Meals)"
                                }
                              }
                            }
                          }
                        },
                        "Number of meals": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "Z\\Eh"
                            },
                            "name": {
                              "type": "string",
                              "example": "Number of meals"
                            },
                            "type": {
                              "type": "string",
                              "example": "rollup"
                            },
                            "rollup": {
                              "type": "object",
                              "properties": {
                                "rollup_property_name": {
                                  "type": "string",
                                  "example": "Name"
                                },
                                "relation_property_name": {
                                  "type": "string",
                                  "example": "Meals"
                                },
                                "rollup_property_id": {
                                  "type": "string",
                                  "example": "title"
                                },
                                "relation_property_id": {
                                  "type": "string",
                                  "example": "mxp^"
                                },
                                "function": {
                                  "type": "string",
                                  "example": "count"
                                }
                              }
                            }
                          }
                        },
                        "Store availability": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "s}Kq"
                            },
                            "name": {
                              "type": "string",
                              "example": "Store availability"
                            },
                            "type": {
                              "type": "string",
                              "example": "multi_select"
                            },
                            "multi_select": {
                              "type": "object",
                              "properties": {
                                "options": {
                                  "type": "array",
                                  "items": {
                                    "type": "object",
                                    "properties": {
                                      "id": {
                                        "type": "string",
                                        "example": "cb79b393-d1c1-4528-b517-c450859de766"
                                      },
                                      "name": {
                                        "type": "string",
                                        "example": "Duc Loi Market"
                                      },
                                      "color": {
                                        "type": "string",
                                        "example": "blue"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "Photo": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "yfiK"
                            },
                            "name": {
                              "type": "string",
                              "example": "Photo"
                            },
                            "type": {
                              "type": "string",
                              "example": "files"
                            },
                            "files": {
                              "type": "object",
                              "properties": {}
                            }
                          }
                        },
                        "Food group": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "CM%3EH"
                            },
                            "name": {
                              "type": "string",
                              "example": "Food group"
                            },
                            "type": {
                              "type": "string",
                              "example": "select"
                            },
                            "select": {
                              "type": "object",
                              "properties": {
                                "options": {
                                  "type": "array",
                                  "items": {
                                    "type": "object",
                                    "properties": {
                                      "id": {
                                        "type": "string",
                                        "example": "6d4523fa-88cb-4ffd-9364-1e39d0f4e566"
                                      },
                                      "name": {
                                        "type": "string",
                                        "example": "🥦Vegetable"
                                      },
                                      "color": {
                                        "type": "string",
                                        "example": "green"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "Name": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "title"
                            },
                            "name": {
                              "type": "string",
                              "example": "Name"
                            },
                            "type": {
                              "type": "string",
                              "example": "title"
                            },
                            "title": {
                              "type": "object",
                              "properties": {}
                            }
                          }
                        }
                      }
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "page_id"
                        },
                        "page_id": {
                          "type": "string",
                          "example": "98ad959b-2b6a-4774-80ee-00246fb0ea9b"
                        }
                      }
                    },
                    "archived": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "is_inline": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "public_url": {}
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          },
          "404": {
            "description": "404",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"error\",\n  \"status\": 404,\n  \"code\": \"object_not_found\",\n  \"message\": \"Could not find database with ID: a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822c. Make sure the relevant pages and databases are shared with your integration.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 404,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "object_not_found"
                    },
                    "message": {
                      "type": "string",
                      "example": "Could not find database with ID: a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822c. Make sure the relevant pages and databases are shared with your integration."
                    }
                  }
                }
              }
            }
          },
          "429": {
            "description": "429",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"error\",\n  \"status\": 429,\n  \"code\": \"rate_limited\",\n  \"message\": \"You have been rate limited. Please try again in a few minutes.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 429,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "rate_limited"
                    },
                    "message": {
                      "type": "string",
                      "example": "You have been rate limited. Please try again in a few minutes."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const databaseId = '668d797c-76fa-4934-9b05-ad288df2d136';\n  const response = await notion.databases.retrieve({ database_id: databaseId });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/databases/668d797c-76fa-4934-9b05-ad288df2d136' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H 'Notion-Version: 2022-06-28'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:61200274545410001802c26b"
}
```

---

# Update a database

Updates the database object — the title, description, or properties — of a specified database. Returns the updated database object . Database properties represent the columns (or schema) of a database. To update the properties of a database, use the properties body param with this endpoint. Learn mo...

Updates the database object — the title, description, or properties — of a specified database.

Returns the updated [database object](https://developers.notion.com/reference/database).

Database properties represent the columns (or schema) of a database. To update the properties of a database, use the `properties` [body param](https://developers.notion.com/reference/update-property-schema-object) with this endpoint. Learn more about database properties in the [database properties](https://developers.notion.com/reference/property-object) and [Update database properties](https://developers.notion.com/reference/update-property-schema-object) docs.

To update a `relation` database property, share the related database with the integration. Learn more about relations in the [database properties](https://developers.notion.com/reference/property-object#relation) page.

For an overview of how to use the REST API with databases, refer to the [Working with databases](https://developers.notion.com/docs/working-with-databases) guide.

### How database property type changes work

All properties in pages are stored as rich text. Notion will convert that rich text based on the types defined in a database's schema. When a type is changed using the API, the data will continue to be available, it is just presented differently.

For example, a multi select property value is represented as a comma-separated list of strings (eg. "1, 2, 3") and a people property value is represented as a comma-separated list of IDs. These are compatible and the type can be converted.

Note: Not all type changes work. In some cases data will no longer be returned, such as people type → file type.

### Interacting with database rows

This endpoint cannot be used to update database rows.

To update the properties of a database row — rather than a column — use the [Update page properties](https://developers.notion.com/reference/patch-page) endpoint. To add a new row to a database, use the [Create a page](https://developers.notion.com/reference/post-page) endpoint.

### Recommended database schema size limit

Developers are encouraged to keep their database schema size to a maximum of **50KB**. To stay within this schema size limit, the number of properties (or columns) added to a database should be managed.

Database schema updates that are too large will be blocked by the REST API to help developers keep their database queries performant.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

> 🚧 The following database properties cannot be updated via the API:
>
> - `formula`
> - `select`
> - `status`
> - [Synced content](https://www.notion.so/help/guides/synced-databases-bridge-different-tools)
> - A `multi_select` database property’s options values. An option can be removed, but not updated.

> 📘 Database relations must be shared with your integration
>
> To update a database [relation](https://www.notion.so/help/relations-and-rollups#what-is-a-database-relation) property, the related database must also be shared with your integration.

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/databases/{database_id}": {
      "patch": {
        "summary": "Update a database",
        "description": "",
        "operationId": "update-a-database",
        "parameters": [
          {
            "name": "database_id",
            "in": "path",
            "description": "identifier for a Notion database",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "array",
                    "description": "An array of [rich text objects](https://developers.notion.com/reference/rich-text) that represents the title of the database that is displayed in the Notion UI. If omitted, then the database title remains unchanged."
                  },
                  "description": {
                    "type": "array",
                    "description": "An array of [rich text objects](https://developers.notion.com/reference/rich-text) that represents the description of the database that is displayed in the Notion UI. If omitted, then the database description remains unchanged."
                  },
                  "properties": {
                    "type": "string",
                    "description": "The properties of a database to be changed in the request, in the form of a JSON object. If updating an existing property, then the keys are the names or IDs of the properties as they appear in Notion, and the values are [property schema objects](ref:property-schema-object). If adding a new property, then the key is the name of the new database property and the value is a [property schema object](ref:property-schema-object).",
                    "format": "json"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"database\",\n  \"id\": \"668d797c-76fa-4934-9b05-ad288df2d136\",\n  \"created_time\": \"2020-03-17T19:10:00.000Z\",\n  \"last_edited_time\": \"2021-08-11T17:26:00.000Z\",\n  \"parent\": {\n    \"type\": \"page_id\",\n    \"page_id\": \"48f8fee9-cd79-4180-bc2f-ec0398253067\"\n  },  \n  \"icon\": {\n    \"type\": \"emoji\",\n    \"emoji\": \"📝\"\n \t},\n  \"cover\": {\n  \t\"type\": \"external\",\n    \"external\": {\n    \t\"url\": \"https://website.domain/images/image.png\"\n    }\n  },\n  \"url\": \"https://www.notion.so/668d797c76fa49349b05ad288df2d136\",\n  \"title\": [\n    {\n      \"type\": \"text\",\n      \"text\": {\n        \"content\": \"Today'\\''s grocery list\",\n        \"link\": null\n      },\n      \"annotations\": {\n        \"bold\": false,\n        \"italic\": false,\n        \"strikethrough\": false,\n        \"underline\": false,\n        \"code\": false,\n        \"color\": \"default\"\n      },\n      \"plain_text\": \"Today'\\''s grocery list\",\n      \"href\": null\n    }\n  ],\n  \"description\": [\n    {\n      \"type\": \"text\",\n      \"text\": {\n        \"content\": \"Grocery list for just kale 🥬\",\n        \"link\": null\n      },\n      \"annotations\": {\n        \"bold\": false,\n        \"italic\": false,\n        \"strikethrough\": false,\n        \"underline\": false,\n        \"code\": false,\n        \"color\": \"default\"\n      },\n      \"plain_text\": \"Grocery list for just kale 🥬\",\n      \"href\": null\n    }\n  ],\n  \"properties\": {\n    \"Name\": {\n      \"id\": \"title\",\n\t\t\t\"name\": \"Name\",\n      \"type\": \"title\",\n      \"title\": {}\n    },\n    \"Description\": {\n      \"id\": \"J@cS\",\n\t\t\t\"name\": \"Description\",\n      \"type\": \"rich_text\",\n      \"rich_text\": {}\n    },\n    \"In stock\": {\n      \"id\": \"{xY`\",\n\t\t\t\"name\": \"In stock\",\n      \"type\": \"checkbox\",\n      \"checkbox\": {}\n    },\n    \"Food group\": {\n      \"id\": \"TJmr\",\n\t\t\t\"name\": \"Food group\",\n      \"type\": \"select\",\n      \"select\": {\n        \"options\": [\n          {\n            \"id\": \"96eb622f-4b88-4283-919d-ece2fbed3841\",\n            \"name\": \"🥦Vegetable\",\n            \"color\": \"green\"\n          },\n          {\n            \"id\": \"bb443819-81dc-46fb-882d-ebee6e22c432\",\n            \"name\": \"🍎Fruit\",\n            \"color\": \"red\"\n          },\n          {\n            \"id\": \"7da9d1b9-8685-472e-9da3-3af57bdb221e\",\n            \"name\": \"💪Protein\",\n            \"color\": \"yellow\"\n          }\n        ]\n      }\n    },\n    \"Price\": {\n      \"id\": \"cU^N\",\n\t\t\t\"name\": \"Price\",\n      \"type\": \"number\",\n      \"number\": {\n        \"format\": \"dollar\"\n      }\n    },\n    \"Cost of next trip\": {\n      \"id\": \"p:sC\",\n\t\t\t\"name\": \"Cost of next trip\",\n      \"type\": \"formula\",\n      \"formula\": {\n        \"value\": \"if(prop(\\\"In stock\\\"), 0, prop(\\\"Price\\\"))\"\n      }\n    },\n    \"Last ordered\": {\n      \"id\": \"]\\\\R[\",\n\t\t\t\"name\": \"Last ordered\",\n      \"type\": \"date\",\n      \"date\": {}\n    },\n    \"Meals\": {\n\t\t\t\"id\": \"gqk%60\",\n            \"name\": \"Meals\",\n      \"type\": \"relation\",\n      \"relation\": {\n        \"database\": \"668d797c-76fa-4934-9b05-ad288df2d136\",\n        \"synced_property_name\": null\n      }\n    },\n    \"Number of meals\": {\n      \"id\": \"Z\\\\Eh\",\n\t\t\t\"name\": \"Number of meals\",\n      \"type\": \"rollup\",\n      \"rollup\": {\n        \"rollup_property_name\": \"Name\",\n        \"relation_property_name\": \"Meals\",\n        \"rollup_property_id\": \"title\",\n        \"relation_property_id\": \"mxp^\",\n        \"function\": \"count\"\n      }\n    },\n    \"Store availability\": {\n\t\t\t\"id\": \"G%7Dji\",\n      \"name\": \"Store availability\",\n      \"type\": \"multi_select\",\n      \"multi_select\": {\n        \"options\": [\n          [\n            {\n              \"id\": \"d209b920-212c-4040-9d4a-bdf349dd8b2a\",\n              \"name\": \"Duc Loi Market\",\n              \"color\": \"blue\"\n            },\n            {\n              \"id\": \"70104074-0f91-467b-9787-00d59e6e1e41\",\n              \"name\": \"Rainbow Grocery\",\n              \"color\": \"gray\"\n            },\n            {\n              \"id\": \"6c3867c5-d542-4f84-b6e9-a420c43094e7\",\n              \"name\": \"Gus's Community Market\",\n              \"color\": \"yellow\"\n            },\n            {\n\t\t\t\t\t\t\t\"id\": \"a62fbb5f-fed4-44a4-8cac-cba5f518c1a1\",\n              \"name\": \"The Good Life Grocery\",\n              \"color\": \"orange\"\n           }\n          ]\n        ]\n      }\n    }\n    \"Photo\": {\n      \"id\": \"aTIT\",\n\t\t\t\"name\": \"Photo\",\n      \"type\": \"url\",\n      \"url\": {}\n    }\n  },\n  \"is_inline\": false\n}"
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 400,\n    \"code\": \"validation_error\",\n    \"message\": \"body failed validation: body.title[0].text.content.length should be ≤ `2000`, instead was `2022`.\"\n}"
                  }
                },
                "schema": {
                  "oneOf": [
                    {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "error"
                        },
                        "status": {
                          "type": "integer",
                          "example": 400,
                          "default": 0
                        },
                        "code": {
                          "type": "string",
                          "example": "invalid_json"
                        },
                        "message": {
                          "type": "string",
                          "example": "Error parsing JSON body."
                        }
                      }
                    },
                    {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "error"
                        },
                        "status": {
                          "type": "integer",
                          "example": 400,
                          "default": 0
                        },
                        "code": {
                          "type": "string",
                          "example": "validation_error"
                        },
                        "message": {
                          "type": "string",
                          "example": "body failed validation: body.title[0].text.content.length should be ≤ `2000`, instead was `2022`."
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "404": {
            "description": "404",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 404,\n    \"code\": \"object_not_found\",\n    \"message\": \"Could not find database with ID: a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822c. Make sure the relevant pages and databases are shared with your integration.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 404,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "object_not_found"
                    },
                    "message": {
                      "type": "string",
                      "example": "Could not find database with ID: a1d8501e-1ac1-43e9-a6bd-ea9fe6c8822c. Make sure the relevant pages and databases are shared with your integration."
                    }
                  }
                }
              }
            }
          },
          "429": {
            "description": "429",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"error\",\n\t\"status\": 429,\n\t\"code\": \"rate_limited\",\n\t\"message\": \"You have been rate limited. Please try again in a few minutes.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 429,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "rate_limited"
                    },
                    "message": {
                      "type": "string",
                      "example": "You have been rate limited. Please try again in a few minutes."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "curl",
              "code": "curl --location --request PATCH 'https://api.notion.com/v1/databases/668d797c-76fa-4934-9b05-ad288df2d136' \\\n--header 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n--header 'Content-Type: application/json' \\\n--header 'Notion-Version: 2022-06-28' \\\n--data '{\n    \"title\": [\n        {\n            \"text\": {\n                \"content\": \"Today'\\''s grocery list\"\n            }\n        }\n    ],\n    \"description\": [\n        {\n            \"text\": {\n                \"content\": \"Grocery list for just kale 🥬\"\n            }\n        }\n    ],\n    \"properties\": {\n        \"+1\": null,\n        \"Photo\": {\n            \"url\": {}\n        },\n        \"Store availability\": {\n            \"multi_select\": {\n                \"options\": [\n                    {\n                        \"name\": \"Duc Loi Market\"\n                    },\n                    {\n                        \"name\": \"Rainbow Grocery\"\n                    },\n                    {\n                        \"name\": \"Gus'\\''s Community Market\"\n                    },\n                    {\n                        \"name\": \"The Good Life Grocery\",\n                        \"color\": \"orange\"\n                    }\n                ]\n            }\n        }\n    }       \n}'"
            }
          ],
          "samples-languages": [
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:612001cf5a94a3006f0e8ffb"
}
```

---

# Update database properties

The API represents columns of a database in the Notion UI as database properties. To use the API to update a database’s properties, send a PATCH request with a properties body param. Remove a property To remove a database property, set the property object to null. "properties": { "J@cT": null, } "pr...

The API represents columns of a database in the Notion UI as database properties.

To use the API to update a database’s properties, send a [PATCH request](https://developers.notion.com/reference/update-a-database) with a `properties` body param.

## Remove a property

To remove a database property, set the property object to null.
[block:code]
{
  "codes": [
    {
      "code": "\"properties\": {\n  \"J@cT\": null,\n}",
      "language": "json",
      "name": "removing properties by ID"
    }
  ],
  "sidebar": true
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "\"properties\": {\n  \"propertyToDelete\": null\n}",
      "language": "json",
      "name": "removing properties by name"
    }
  ],
  "sidebar": true
}
[/block]
## Rename a property

To change the name of a database property, indicate the new name in the `name` property object value.
[block:code]
{
  "codes": [
    {
      "code": "\"properties\": {\n\t\"J@cT\": {\n\t\t\"name\": \"New Property Name\"\n  }\n}",
      "language": "json",
      "name": "renaming properties by ID"
    }
  ],
  "sidebar": true
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "\"properties\": {\n  \"Old Property Name\": {\n    \"name\": \"New Property Name\n  }\n}",
      "language": "json",
      "name": "renaming properties by name"
    }
  ],
  "sidebar": true
}
[/block]

[block:parameters]
{
  "data": {
    "h-0": "Property",
    "h-1": "Type",
    "h-2": "Description",
    "0-0": "`name`",
    "0-1": "`string`",
    "0-2": "The name of the property as it appears in Notion."
  },
  "cols": 3,
  "rows": 1
}
[/block]
## Update property type

To update the property type, the property schema object should contain the key of the type. This type contains behavior of this property. Possible values of this key are `"title"`, `"rich_text"`, `"number"`, `"select"`, `"multi_select"`, `"date"`, `"people"`, `"files"`, `"checkbox"`, `"url"`, `"email"`, `"phone_number"`, `"formula"`, `"relation"`, `"rollup"`, `"created_time"`, `"created_by"`, `"last_edited_time"`, `"last_edited_by"`. Within this property, the configuration is a [property schema object](https://developers.notion.com/reference/property-schema-object).

[block:callout]
{
  "type": "danger",
  "title": "Limitations",
  "body": "Note that the property type of the `title` cannot be changed.\n\nIt's not possible to update the `name` or `options` values of a `status` property via the API."
}
[/block]
### Select configuration updates

To update an existing select configuration, the property schema object optionally contains the following configuration within the `select` property:
[block:parameters]
{
  "data": {
    "h-0": "Property",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`options`",
    "0-1": "optional array of [existing select options](#existing-select-options) and [select option objects](ref:create-a-database#select-options)",
    "0-2": "Settings for select properties. If an existing option is omitted, it will be removed from the database property. New options will be added to the database property."
  },
  "cols": 4,
  "rows": 1
}
[/block]
#### Existing select options

Note that the name and color of an existing option cannot be updated.
[block:parameters]
{
  "data": {
    "h-0": "Property",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`name`",
    "0-1": "optional `string`",
    "0-2": "Name of the option.",
    "0-3": "`\"Fruit\"`",
    "1-0": "`id`",
    "1-1": "optional `string`",
    "1-2": "ID of the option.",
    "1-3": "`\"ff8e9269-9579-47f7-8f6e-83a84716863c\"\n`"
  },
  "cols": 4,
  "rows": 2
}
[/block]
### Multi-select configuration updates

To update an existing select configuration, the property schema object optionally contains the following configuration within the `multi_select` property:
[block:parameters]
{
  "data": {
    "h-0": "Property",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`options`",
    "0-1": "optional array of [existing select options](#existing-multi-select-options) and [multi-select option objects](ref:create-a-database#multi-select-options)",
    "0-2": "Settings for multi select properties. If an existing option is omitted, it will be removed from the database property. New options will be added to the database property."
  },
  "cols": 4,
  "rows": 1
}
[/block]
#### Existing multi-select options

Note that the name and color of an existing option cannot be updated.
[block:parameters]
{
  "data": {
    "h-0": "Property",
    "h-1": "Type",
    "h-2": "Description",
    "h-3": "Example value",
    "0-0": "`name`",
    "0-1": "`string`",
    "0-2": "Name of the option as it appears in Notion.",
    "0-3": "`\"Fruit\"`",
    "1-0": "`id`",
    "1-1": "optional `string`",
    "1-2": "ID of the option.",
    "1-3": "`\"ff8e9269-9579-47f7-8f6e-83a84716863c\"\n`"
  },
  "cols": 4,
  "rows": 2
}
[/block]
 ## Limitations

### Formula maximum depth
Formulas in Notion can have high levels of complexity beyond what the API can compute in a single request. For `formula` property values that exceed *have or exceed depth of 10*  referenced tables, the API will return a "Formula depth" error as a [`"validation_error"`](https://developers.notion.com/reference/errors)

As a workaround, you can retrieve the `formula` property object from the Retrieve a Database endpoint and use the formula expression to compute the value of more complex formulas.

### Unsupported Rollup Aggregations
Due to the encoded cursor nature of computing rollup values, a subset of aggregation types are not supported. Instead the endpoint returns a list of *all* property_item objects for the following rollup aggregations:
* `show_unique` (Show unique values)
* `unique` (Count unique values)
* `median` (Median)

### `Could not find page/database` Error
A page property of type `rollup` and `formula` can involve computing a value based on the properties in another `relation` page. As such the integration needs permissions to the other `relation` page. If the integration doesn't have permissions page needed to compute the property value, the API will return a [`"object_not_found"`](https://developers.notion.com/reference/errors) error specifying the page the integration lacks permissions to.

### Property value doesn't match UI after pagination
If a property value involves [pagination](https://developers.notion.com/reference/pagination) and the underlying properties or pages used to compute the property value change whilst the integration is paginating through results, the final value will impacted and is not guaranteed to be accurate.

---

# Create comment

Creates a comment in a page or existing discussion thread.

Returns a [comment object](https://developers.notion.com/reference/comment-object) for the created comment.

There are two locations where a new comment can be added with the public API:

1. A page.
2. An existing discussion thread.

The request body will differ slightly depending on which type of comment is being added with this endpoint.

To add a new comment to a page, a `parent` object with a `page_id` must be provided in the body params.

To add a new comment to an existing discussion thread, a `discussion_id` string must be provided in the body params. (Inline comments to start a new discussion thread cannot be created via the public API.)

**_Either_ the `parent.page_id` _or_ `discussion_id` parameter must be provided — not both**.

To see additional examples of creating a [page](https://developers.notion.com/docs/working-with-comments#adding-a-comment-to-a-page) or [discussion](https://developers.notion.com/docs/working-with-comments#responding-to-a-discussion-thread) comment and to learn more about comments in Notion, see the [Working with comments](https://developers.notion.com/docs/working-with-comments) guide.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

> 📘 Reminder: Turn on integration comment capabilities
>
> Integration capabilities for reading and inserting comments are off by default.
>
> This endpoint requires an integration to have insert comment capabilities. Attempting to call this endpoint without insert comment capabilities will return an HTTP response with a 403 status code.
>
> For more information on integration capabilities, see the [capabilities guide](https://developers.notion.com/reference/capabilities). To update your integration settings, visit the [integration dashboard](https://www.notion.so/my-integrations).

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/comments": {
      "post": {
        "summary": "Create comment",
        "description": "Creates a comment in a page or existing discussion thread.",
        "operationId": "create-a-comment",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "rich_text"
                ],
                "properties": {
                  "parent": {
                    "type": "string",
                    "description": "A [page parent](/reference/database#page-parent). Either this or a discussion_id is required (not both)",
                    "format": "json"
                  },
                  "discussion_id": {
                    "type": "string",
                    "description": "A UUID identifier for a discussion thread. Either this or a parent object is required (not both)"
                  },
                  "rich_text": {
                    "type": "string",
                    "description": "A [rich text object](ref:rich-text)",
                    "format": "json"
                  },
                  "attachments": {
                    "type": "string",
                    "description": "An array of [comment attachment requests](ref:comment-attachment#request-format-input)",
                    "format": "json"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"comment\",\n    \"id\": \"b52b8ed6-e029-4707-a671-832549c09de3\",\n    \"parent\": {\n        \"type\": \"page_id\",\n        \"page_id\": \"5c6a2821-6bb1-4a7e-b6e1-c50111515c3d\"\n    },\n    \"discussion_id\": \"f1407351-36f5-4c49-a13c-49f8ba11776d\",\n    \"created_time\": \"2022-07-15T20:53:00.000Z\",\n    \"last_edited_time\": \"2022-07-15T20:53:00.000Z\",\n    \"created_by\": {\n        \"object\": \"user\",\n        \"id\": \"067dee40-6ebd-496f-b446-093c715fb5ec\"\n    },\n    \"rich_text\": [\n        {\n            \"type\": \"text\",\n            \"text\": {\n                \"content\": \"Hello world\",\n                \"link\": null\n            },\n            \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n            },\n            \"plain_text\": \"Hello world\",\n            \"href\": null\n        }\n   ],\n   \"attachments\": [\n    {\n      \"category\": \"image\",\n      \"file\": {\n        \"url\": \"https://s3.us-west-2.amazonaws.com/...\",\n        \"expiry_time\": \"2025-06-10T21:58:51.599Z\"\n      }\n    }\n  ]\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "comment"
                    },
                    "id": {
                      "type": "string",
                      "example": "b52b8ed6-e029-4707-a671-832549c09de3"
                    },
                    "parent": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "example": "page_id"
                        },
                        "page_id": {
                          "type": "string",
                          "example": "5c6a2821-6bb1-4a7e-b6e1-c50111515c3d"
                        }
                      }
                    },
                    "discussion_id": {
                      "type": "string",
                      "example": "f1407351-36f5-4c49-a13c-49f8ba11776d"
                    },
                    "created_time": {
                      "type": "string",
                      "example": "2022-07-15T20:53:00.000Z"
                    },
                    "last_edited_time": {
                      "type": "string",
                      "example": "2022-07-15T20:53:00.000Z"
                    },
                    "created_by": {
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "user"
                        },
                        "id": {
                          "type": "string",
                          "example": "067dee40-6ebd-496f-b446-093c715fb5ec"
                        }
                      }
                    },
                    "rich_text": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "example": "text"
                          },
                          "text": {
                            "type": "object",
                            "properties": {
                              "content": {
                                "type": "string",
                                "example": "Hello world"
                              },
                              "link": {}
                            }
                          },
                          "annotations": {
                            "type": "object",
                            "properties": {
                              "bold": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "italic": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "strikethrough": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "underline": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "code": {
                                "type": "boolean",
                                "example": false,
                                "default": true
                              },
                              "color": {
                                "type": "string",
                                "example": "default"
                              }
                            }
                          },
                          "plain_text": {
                            "type": "string",
                            "example": "Hello world"
                          },
                          "href": {}
                        }
                      }
                    },
                    "attachments": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "category": {
                            "type": "string",
                            "example": "image"
                          },
                          "file": {
                            "type": "object",
                            "properties": {
                              "url": {
                                "type": "string",
                                "example": "https://s3.us-west-2.amazonaws.com/..."
                              },
                              "expiry_time": {
                                "type": "string",
                                "example": "2025-06-10T21:58:51.599Z"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "403": {
            "description": "403",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 403,\n    \"code\": \"restricted_resource\",\n    \"message\": \"Insufficient permissions for this endpoint.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 403,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "restricted_resource"
                    },
                    "message": {
                      "type": "string",
                      "example": "Insufficient permissions for this endpoint."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const response = await notion.comments.create({\n    \"parent\": {\n      \"page_id\": \"5c6a28216bb14a7eb6e1c50111515c3d\"\n    },\n    \"rich_text\": [\n      {\n        \"text\": {\n          \"content\": \"Hello world\"\n        }\n      }\n    ],\n    \"attachments\": [\n      {\n        \"file_upload_id\": \"48656c6c-6f20-576f-726c-64212048692e\"\n      }\n    ]\n\t});\n  \n  console.log(response);\n})();\n",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/comments' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Notion-Version: 2022-06-28' \\\n  --data '{\n    \"parent\": {\n      \"page_id\": \"5c6a28216bb14a7eb6e1c50111515c3d\"\n    },\n    \"rich_text\": [\n      {\n        \"text\": {\n          \"content\": \"Hello world\"\n        }\n      }\n    ],\n    \"attachments\": [\n      {\n        \"file_upload_id\": \"48656c6c-6f20-576f-726c-64212048692e\"\n      }\n    ]\n\t}'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:62d1959cb1470f00438dcc1e"
}
```

---

# Retrieve comments

Retrieves a list of un-resolved Comment objects from a page or block.

See [Pagination](https://developers.notion.com/reference/intro#pagination) for details about how to use a cursor to iterate through the list.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

> 📘 Reminder: Turn on integration comment capabilities
>
> Integration capabilities for reading and inserting comments are off by default.
>
> This endpoint requires an integration to have read comment capabilities. Attempting to call this endpoint without read comment capabilities will return an HTTP response with a 403 status code.
>
> For more information on integration capabilities, see the [capabilities guide](https://developers.notion.com/reference/capabilities). To update your integration settings, visit the [integration dashboard](https://www.notion.so/my-integrations).

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/comments": {
      "get": {
        "summary": "Retrieve comments",
        "description": "Retrieves a list of un-resolved [Comment objects](ref:comment-object) from a page or block.",
        "operationId": "retrieve-a-comment",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "block_id",
            "in": "query",
            "description": "Identifier for a Notion block or page",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "start_cursor",
            "in": "query",
            "description": "If supplied, this endpoint will return a page of results starting after the cursor provided. If not supplied, this endpoint will return the first page of results.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page_size",
            "in": "query",
            "description": "The number of items from the full list desired in the response. Maximum: 100",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "OK": {
                    "value": "{\n    \"object\": \"list\",\n    \"results\": [\n        {\n            \"object\": \"comment\",\n            \"id\": \"94cc56ab-9f02-409d-9f99-1037e9fe502f\",\n            \"parent\": {\n                \"type\": \"page_id\",\n                \"page_id\": \"5c6a2821-6bb1-4a7e-b6e1-c50111515c3d\"\n            },\n            \"discussion_id\": \"f1407351-36f5-4c49-a13c-49f8ba11776d\",\n            \"created_time\": \"2022-07-15T16:52:00.000Z\",\n            \"last_edited_time\": \"2022-07-15T19:16:00.000Z\",\n            \"created_by\": {\n                \"object\": \"user\",\n                \"id\": \"9b15170a-9941-4297-8ee6-83fa7649a87a\"\n            },\n            \"rich_text\": [\n                {\n                    \"type\": \"text\",\n                    \"text\": {\n                        \"content\": \"Single comment\",\n                        \"link\": null\n                    },\n                    \"annotations\": {\n                        \"bold\": false,\n                        \"italic\": false,\n                        \"strikethrough\": false,\n                        \"underline\": false,\n                        \"code\": false,\n                        \"color\": \"default\"\n                    },\n                    \"plain_text\": \"Single comment\",\n                    \"href\": null\n                }\n            ]\n        }\n    ],\n    \"next_cursor\": null,\n    \"has_more\": false,\n    \"type\": \"comment\",\n    \"comment\": {}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "list"
                    },
                    "results": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "object": {
                            "type": "string",
                            "example": "comment"
                          },
                          "id": {
                            "type": "string",
                            "example": "94cc56ab-9f02-409d-9f99-1037e9fe502f"
                          },
                          "parent": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "page_id"
                              },
                              "page_id": {
                                "type": "string",
                                "example": "5c6a2821-6bb1-4a7e-b6e1-c50111515c3d"
                              }
                            }
                          },
                          "discussion_id": {
                            "type": "string",
                            "example": "f1407351-36f5-4c49-a13c-49f8ba11776d"
                          },
                          "created_time": {
                            "type": "string",
                            "example": "2022-07-15T16:52:00.000Z"
                          },
                          "last_edited_time": {
                            "type": "string",
                            "example": "2022-07-15T19:16:00.000Z"
                          },
                          "created_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "9b15170a-9941-4297-8ee6-83fa7649a87a"
                              }
                            }
                          },
                          "rich_text": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "example": "text"
                                },
                                "text": {
                                  "type": "object",
                                  "properties": {
                                    "content": {
                                      "type": "string",
                                      "example": "Single comment"
                                    },
                                    "link": {}
                                  }
                                },
                                "annotations": {
                                  "type": "object",
                                  "properties": {
                                    "bold": {
                                      "type": "boolean",
                                      "example": false,
                                      "default": true
                                    },
                                    "italic": {
                                      "type": "boolean",
                                      "example": false,
                                      "default": true
                                    },
                                    "strikethrough": {
                                      "type": "boolean",
                                      "example": false,
                                      "default": true
                                    },
                                    "underline": {
                                      "type": "boolean",
                                      "example": false,
                                      "default": true
                                    },
                                    "code": {
                                      "type": "boolean",
                                      "example": false,
                                      "default": true
                                    },
                                    "color": {
                                      "type": "string",
                                      "example": "default"
                                    }
                                  }
                                },
                                "plain_text": {
                                  "type": "string",
                                  "example": "Single comment"
                                },
                                "href": {}
                              }
                            }
                          }
                        }
                      }
                    },
                    "next_cursor": {},
                    "has_more": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "comment"
                    },
                    "comment": {
                      "type": "object",
                      "properties": {}
                    }
                  }
                }
              }
            }
          },
          "403": {
            "description": "403",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 403,\n    \"code\": \"restricted_resource\",\n    \"message\": \"Insufficient permissions for this endpoint.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 403,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "restricted_resource"
                    },
                    "message": {
                      "type": "string",
                      "example": "Insufficient permissions for this endpoint."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const blockId = 'd40e767c-d7af-4b18-a86d-55c61f1e39a4';\n  const response = await notion.comments.list({ block_id: blockId });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/comments?block_id=5c6a28216bb14a7eb6e1c50111515c3d'\\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Notion-Version: 2022-06-28\""
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:62d195385aa7650013fee93d"
}
```

---

# Create a file upload

Use this API to initiate the process of uploading a file to your Notion workspace.

For a successful request, the response is a [File Upload](ref:file-upload) object with a `status` of `"pending"`.

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/file_uploads": {
      "post": {
        "summary": "Create a file upload",
        "description": "Use this API to initiate the process of [uploading a file](doc:working-with-files-and-media) to your Notion workspace.",
        "operationId": "create-a-file-upload",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "mode": {
                    "type": "string",
                    "description": "How the file is being sent. Use `multi_part` for files larger than 20MB. Use `external_url` for files that are temporarily hosted publicly elsewhere. Default is `single_part`.",
                    "default": "single_part",
                    "enum": [
                      "single_part",
                      "multi_part",
                      "external_url"
                    ]
                  },
                  "filename": {
                    "type": "string",
                    "description": "Name of the file to be created. Required when `mode` is `multi_part` or `external_url`. Otherwise optional, and used to override the filename. Must include an extension, or have one inferred from the `content_type` parameter."
                  },
                  "content_type": {
                    "type": "string",
                    "description": "MIME type of the file to be created. Recommended when sending the file in multiple parts. Must match the content type of the file that's sent, and the extension of the `filename` parameter if any."
                  },
                  "number_of_parts": {
                    "type": "integer",
                    "description": "When `mode` is `multi_part`, the number of parts you are uploading. Must be between 1 and 1,000. This must match the number of parts as well as the final `part_number` you send.",
                    "format": "int32"
                  },
                  "external_url": {
                    "type": "string",
                    "description": "When `mode` is `external_url`, provide the HTTPS URL of a publicly accessible file to import into your workspace."
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"id\": \"b52b8ed6-e029-4707-a671-832549c09de3\",\n\t\"object\": \"file_upload\",\n\t\"created_time\": \"2025-03-15T20:53:00.000Z\",\n\t\"last_edited_time\": \"2025-03-15T20:53:00.000Z\",\n  \"expiry_time\": \"2025-03-15T21:53:00.000Z\",\n\t\"upload_url\": \"<<baseUrl>>/v1/file_uploads/b52b8ed6-e029-4707-a671-832549c09de3/send`,\n\t\"archived\": false,\n  \"status\": \"pending\",\n\t\"filename\": \"test.txt\",\n\t\"content_type\": \"text/plain\",\n\t\"content_length\": 1024,\n}"
                  }
                }
              }
            }
          },
          "403": {
            "description": "403",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"error\",\n\t\"status\": 403,\n \t\"code\": \"restricted_resource\",\n\t\"message\": \"Insufficient permissions for this endpoint.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 403,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "restricted_resource"
                    },
                    "message": {
                      "type": "string",
                      "example": "Insufficient permissions for this endpoint."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": []
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:67eace18749e710e21666006"
}
```

---

# Send a file upload

Use this API to transmit file contents to Notion for a file upload .

For this endpoint, use a `Content-Type` of `multipart/form-data`, and provide your file contents under the `file` key.

> 📘
>
> The use of multipart form data is unique to this endpoint. Other Notion APIs, including [Create a file upload](ref:create-a-file-upload) and [Complete a file upload](ref:complete-a-file-upload), use JSON parameters.
>
> Include a `boundary` with the `Content-Type` header of your request as per [RFC 2388](https://datatracker.ietf.org/doc/html/rfc2388). Most request libraries (e.g. `fetch`, `ky`) automatically handle this as long as you provide a form data object but don't overwrite the `Content-Type` explicitly.
>
> For more tips and examples, view the [file upload guide](ref:uploading-small-files#step-2-upload-file-contents).

When `mode=multi_part`, each part must include a form field `part_number` to indicate which part is being sent. Parts may be sent concurrently up to standard Notion API [rate limits](ref:request-limits), and may be sent out of order as long as all parts (1, ..., `part_number`) are successfully sent before calling the [complete file upload API](https://developers.notion.com/reference/complete-a-file-upload).

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/file_uploads/{file_upload_id}/send": {
      "post": {
        "summary": "Send a file upload",
        "description": "Use this API to transmit file contents to Notion for a [file upload](ref:file-upload).",
        "operationId": "send-a-file-upload",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "file"
                ],
                "properties": {
                  "file": {
                    "type": "string",
                    "description": "The raw binary file contents to upload.",
                    "format": "binary"
                  },
                  "part_number": {
                    "type": "string",
                    "description": "When using a `mode=multi_part` File Upload to send files greater than 20 MB in parts, this is the current part number. Must be an integer between 1 and 1000 provided as a string form field."
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"id\": \"b52b8ed6-e029-4707-a671-832549c09de3\",\n\t\"object\": \"file_upload\",\n\t\"created_time\": \"2025-03-15T20:53:00.000Z\",\n\t\"last_edited_time\": \"2025-03-15T20:57:00.000Z\",\n  \"expiry_time\": \"2025-03-15T21:53:00.000Z\",\n\t\"upload_url\": null,\n\t\"archived\": false,\n  \"status\": \"uploaded\",\n\t\"filename\": \"test.txt\",\n\t\"content_type\": \"text/plain\",\n\t\"content_length\": 1024,\n}"
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Validation Error (Invalid Status)": {
                    "value": "{\n\t\"object\": \"error\",\n\t\"status\": 400,\n \t\"code\": \"validation_error\",\n\t\"message\": \"File upload with ID b52b8ed6-e029-4707-a671-832549c09de3 is not in the pending status.\"\n}"
                  },
                  "Validation Error (Content Length Limit)": {
                    "value": "{\n\t\"object\": \"error\",\n\t\"status\": 400,\n \t\"code\": \"validation_error\",\n\t\"message\": \"File size of 5242881 bytes exceeds the limit of 5242880.\"\n}"
                  }
                },
                "schema": {
                  "oneOf": [
                    {
                      "title": "Validation Error (Invalid Status)",
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "error"
                        },
                        "status": {
                          "type": "integer",
                          "example": 400,
                          "default": 0
                        },
                        "code": {
                          "type": "string",
                          "example": "validation_error"
                        },
                        "message": {
                          "type": "string",
                          "example": "File upload with ID b52b8ed6-e029-4707-a671-832549c09de3 is not in the pending status."
                        }
                      }
                    },
                    {
                      "title": "Validation Error (Content Length Limit)",
                      "type": "object",
                      "properties": {
                        "object": {
                          "type": "string",
                          "example": "error"
                        },
                        "status": {
                          "type": "integer",
                          "example": 400,
                          "default": 0
                        },
                        "code": {
                          "type": "string",
                          "example": "validation_error"
                        },
                        "message": {
                          "type": "string",
                          "example": "File size of 5242881 bytes exceeds the limit of 5242880."
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "403": {
            "description": "403",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"object\": \"error\",\n\t\"status\": 403,\n \t\"code\": \"restricted_resource\",\n\t\"message\": \"Insufficient permissions for this endpoint.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 403,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "restricted_resource"
                    },
                    "message": {
                      "type": "string",
                      "example": "Insufficient permissions for this endpoint."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "curl",
              "code": "curl --request POST \\\n  --url 'https://api.notion.com/v1/file_uploads/a3f9d3e2-1abc-42de-b904-badc0ffee000/send' \\\n  --header 'Authorization: Bearer ntn_****' \\\n  --header 'Notion-Version: 2022-06-28' \\\n  --header 'Content-Type: multipart/form-data' \\\n  -F \"file=@image_to_upload_split_aa.png\"\n  -F \"part_number=1\""
            },
            {
              "language": "python",
              "code": "import requests\n\n# Path to the 1st part of the split-up file:\nfile_name = \"image_to_upload_split_aa.png\"\n\nwith open(file_name, \"rb\") as f:\n    files = {\n\t\t    # Provide the MIME content type of the file\n\t\t    # as the 3rd argument.\n        \"file\": (file_name, f, \"image/png\"),\n\n        # Use a file name of `None` to treat this as a regular\n        # form field and not a file.\n        \"part_number\": (None, \"1\")\n    }\n\n    # URL can also be obtained from the `upload_url` field\n    # of the Create File Upload response to avoid needing\n    # to manually concatenate the `file_upload_id` and `/send`.\n    url = f\"https://api.notion.com/v1/file_uploads/{file_upload_id}/send\"\n    headers = {\n      \"Authorization\": f\"Bearer {NOTION_KEY}\",\n      \"Notion-Version\": \"2022-06-28\"\n    }\n\n    response = requests.post(url, headers=headers, files=files)\n    print(response.text)"
            },
            {
              "language": "ruby",
              "code": "require 'rest-client'\nrequire 'mime/types'\n\nfile_name = \"image_to_upload_split_aa.png\"\nfile_upload_id = \"YOUR_FILE_UPLOAD_ID\" # Replace with actual upload ID\nnotion_key = \"YOUR_NOTION_KEY\" # Replace with your actual notion key\n\nurl = \"https://api.notion.com/v1/file_uploads/#{file_upload_id}/send\"\n\n# Prepare the file\nfile = File.new(file_name, 'rb')\nfile_content_type = MIME::Types.type_for(file_name).first.content_type\n\n# Prepare headers\nheaders = {\n  Authorization: \"Bearer #{notion_key}\",\n  'Notion-Version': '2022-06-28'\n}\n\n# Prepare multipart data\npayload = {\n  file: RestClient::Payload::File.new(file, filename: file_name, content_type: file_content_type),\n  part_number: '1'\n}\n\n# Send the request\nresponse = RestClient.post(url, payload, headers)\n\n# Print the response\nputs response.body",
              "name": "Ruby"
            },
            {
              "language": "node",
              "code": "const fs = require('fs');\nconst fetch = require('node-fetch');\nconst FormData = require('form-data');\n\nconst file_name = \"image_to_upload_split_aa.png\";\nconst file_upload_id = \"YOUR_FILE_UPLOAD_ID\"; // Replace with actual upload ID\nconst NOTION_KEY = \"YOUR_NOTION_KEY\"; // Replace with your actual notion key\n\n// Prepare form data\nconst form = new FormData();\nform.append('file', fs.createReadStream(file_name), {\n    filename: file_name,\n    contentType: 'image/png',\n});\nform.append('part_number', '1');\n\n// Prepare headers\nconst headers = {\n    'Authorization': `Bearer ${NOTION_KEY}`,\n    'Notion-Version': '2022-06-28',\n    ...form.getHeaders()\n};\n\n// Send the POST request\nconst url = `https://api.notion.com/v1/file_uploads/${file_upload_id}/send`;\nfetch(url, {\n    method: 'POST',\n    headers: headers,\n    body: form\n})\n    .then(response => response.json())\n    .then(data => console.log(data))\n    .catch(error => console.error('Error:', error));",
              "name": "Node"
            },
            {
              "language": "php",
              "code": "<?php\n\nrequire 'vendor/autoload.php'; // Ensure Guzzle is loaded\n\nuse GuzzleHttp\\Client;\n\n$file_name = \"image_to_upload_split_aa.png\";\n$file_upload_id = \"YOUR_FILE_UPLOAD_ID\"; // Replace with actual upload ID\n$NOTION_KEY = \"YOUR_NOTION_KEY\"; // Replace with your actual notion key\n\n// Prepare the Guzzle client\n$client = new Client();\n\n// Prepare the file and other parameters\n$multipart = [\n    [\n        'name' => 'file',\n        'contents' => fopen($file_name, 'r'),\n        'filename' => $file_name,\n        'headers'  => [\n            'Content-Type' => 'image/png'\n        ]\n    ],\n    [\n        'name' => 'part_number',\n        'contents' => '1'\n    ]\n];\n\n// Send the POST request\n$url = \"https://api.notion.com/v1/file_uploads/{$file_upload_id}/send\";\n$response = $client->post($url, [\n    'headers' => [\n        'Authorization' => \"Bearer {$NOTION_KEY}\",\n        'Notion-Version' => '2022-06-28',\n    ],\n    'multipart' => $multipart\n]);\n\n// Print the response\necho $response->getBody();\n?>",
              "name": "PHP"
            }
          ],
          "samples-languages": [
            "curl",
            "python",
            "ruby",
            "node",
            "php"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:67ead0090c04c042179e3ba1"
}
```

---

# Complete a file upload

Use this API to finalize a mode=multi_part file upload after all of the parts have been sent successfully.


# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/file_uploads/{file_upload_id}/complete": {
      "post": {
        "summary": "Complete a file upload",
        "description": "Use this API to finalize a `mode=multi_part` [file upload](ref:file-upload) after all of the parts have been sent successfully.",
        "operationId": "complete-a-file-upload",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"id\": \"b52b8ed6-e029-4707-a671-832549c09de3\",\n\t\"object\": \"file_upload\",\n\t\"created_time\": \"2025-03-15T20:53:00.000Z\",\n\t\"last_edited_time\": \"2025-03-15T20:57:00.000Z\",\n  \"expiry_time\": \"2025-03-15T21:53:00.000Z\",\n\t\"archived\": false,\n  \"status\": \"uploaded\",\n\t\"filename\": \"test.txt\",\n\t\"content_type\": \"text/plain\",\n\t\"content_length\": 1024,\n}"
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": []
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:6802b4c35423d40025ef82af"
}
```

---

# Retrieve a file upload

Use this API to get the details of a File Upload object.


# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/file_uploads/{file_upload_id}": {
      "get": {
        "summary": "Retrieve a file upload",
        "description": "Use this API to get the details of a [File Upload](ref:file-upload) object.",
        "operationId": "retrieve-a-file-upload",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n\t\"id\": \"b52b8ed6-e029-4707-a671-832549c09de3\",\n\t\"object\": \"file_upload\",\n\t\"created_time\": \"2025-03-15T20:53:00.000Z\",\n\t\"last_edited_time\": \"2025-03-15T20:57:00.000Z\",\n  \"expiry_time\": \"2025-03-15T21:53:00.000Z\",\n\t\"upload_url\": null,\n\t\"archived\": false,\n  \"status\": \"uploaded\",\n\t\"filename\": \"test.txt\",\n\t\"content_type\": \"text/plain\",\n\t\"content_length\": 1024,\n}"
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": []
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:6802b50ef9f01a0012857646"
}
```

---

# List file uploads

Use this API to retrieve file uploads for the current bot integration, sorted by most recent first.


# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/file_uploads": {
      "get": {
        "summary": "List file uploads",
        "description": "Use this API to retrieve [file uploads](ref:file-upload) for the current bot integration, sorted by most recent first.",
        "operationId": "list-file-uploads",
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "description": "Filter file uploads by specifying the status. Supported values are `pending`, `uploaded`, `expired`, `failed`.",
            "schema": {
              "type": "string",
              "enum": [
                "pending",
                "uploaded",
                "expired",
                "failed"
              ]
            }
          },
          {
            "name": "start_cursor",
            "in": "query",
            "description": "If supplied, this endpoint will return a page of results starting after the cursor provided. If not supplied, this endpoint will return the first page of results.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page_size",
            "in": "query",
            "description": "The number of items from the full list desired in the response. Maximum: 100",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 100
            }
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:680a532bcd9496006f722974"
}
```

---

# Search by title

Searches all parent or child pages and databases that have been shared with an integration. Returns all pages or databases , excluding duplicated linked databases, that have titles that include the query param. If no query param is provided, then the response contains all pages or databases that hav...

Searches all parent or child pages and databases that have been shared with an integration.

Returns all [pages](https://developers.notion.com/reference/page) or [databases](https://developers.notion.com/reference/database), excluding duplicated linked databases, that have titles that include the `query` param. If no `query` param is provided, then the response contains all pages or databases that have been shared with the integration. The results adhere to any limitations related to an [integration’s capabilities](https://developers.notion.com/reference/capabilities).

To limit the request to search only pages or to search only databases, use the `filter` param.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

> 📘
>
> The Search endpoint supports pagination. To learn more about working with [paginated](https://developers.notion.com/reference/intro#pagination) responses, see the pagination section of the Notion API Introduction.

> 🚧
>
> To search a specific database — not all databases shared with the integration — use the [Query a database](https://developers.notion.com/reference/post-database-query) endpoint instead.

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/search": {
      "post": {
        "summary": "Search by title",
        "description": "",
        "operationId": "post-search",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "query": {
                    "type": "string",
                    "description": "The text that the API compares page and database titles against."
                  },
                  "sort": {
                    "type": "object",
                    "description": "A set of criteria, `direction` and `timestamp` keys, that orders the results. The **only** supported timestamp value is `\"last_edited_time\"`. Supported `direction` values are `\"ascending\"` and `\"descending\"`. If `sort` is not provided, then the most recently edited results are returned first.",
                    "properties": {
                      "direction": {
                        "type": "string",
                        "description": "The direction to sort. Possible values include `ascending` and `descending`."
                      },
                      "timestamp": {
                        "type": "string",
                        "description": "The name of the timestamp to sort against. Possible values include `last_edited_time`."
                      }
                    }
                  },
                  "filter": {
                    "type": "object",
                    "description": "A set of criteria, `value` and `property` keys, that limits the results to either only pages or only databases. Possible `value` values are `\"page\"` or `\"database\"`. The only supported `property` value is `\"object\"`.",
                    "properties": {
                      "value": {
                        "type": "string",
                        "description": "The value of the property to filter the results by.  Possible values for object type include `page` or `database`.  **Limitation**: Currently the only filter allowed is `object` which will filter by type of object (either `page` or `database`)"
                      },
                      "property": {
                        "type": "string",
                        "description": "The name of the property to filter by. Currently the only property you can filter by is the object type.  Possible values include `object`.   Limitation: Currently the only filter allowed is `object` which will filter by type of object (either `page` or `database`)"
                      }
                    }
                  },
                  "start_cursor": {
                    "type": "string",
                    "description": "A `cursor` value returned in a previous response that If supplied, limits the response to results starting after the `cursor`. If not supplied, then the first page of results is returned. Refer to [pagination](https://developers.notion.com/reference/intro#pagination) for more details."
                  },
                  "page_size": {
                    "type": "integer",
                    "description": "The number of items from the full list to include in the response. Maximum: `100`.",
                    "default": 100,
                    "format": "int32"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"list\",\n  \"results\": [\n    {\n      \"object\": \"page\",\n      \"id\": \"954b67f9-3f87-41db-8874-23b92bbd31ee\",\n      \"created_time\": \"2022-07-06T19:30:00.000Z\",\n      \"last_edited_time\": \"2022-07-06T19:30:00.000Z\",\n      \"created_by\": {\n        \"object\": \"user\",\n        \"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n      },\n      \"last_edited_by\": {\n        \"object\": \"user\",\n        \"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n      },\n      \"cover\": {\n        \"type\": \"external\",\n        \"external\": {\n          \"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n        }\n      },\n      \"icon\": {\n        \"type\": \"emoji\",\n        \"emoji\": \"🥬\"\n      },\n      \"parent\": {\n        \"type\": \"database_id\",\n        \"database_id\": \"d9824bdc-8445-4327-be8b-5b47500af6ce\"\n      },\n      \"archived\": false,\n      \"properties\": {\n        \"Store availability\": {\n          \"id\": \"%3AUPp\",\n          \"type\": \"multi_select\",\n          \"multi_select\": []\n        },\n        \"Food group\": {\n          \"id\": \"A%40Hk\",\n          \"type\": \"select\",\n          \"select\": {\n            \"id\": \"5e8e7e8f-432e-4d8a-8166-1821e10225fc\",\n            \"name\": \"🥬 Vegetable\",\n            \"color\": \"pink\"\n          }\n        },\n        \"Price\": {\n          \"id\": \"BJXS\",\n          \"type\": \"number\",\n          \"number\": null\n        },\n        \"Responsible Person\": {\n          \"id\": \"Iowm\",\n          \"type\": \"people\",\n          \"people\": []\n        },\n        \"Last ordered\": {\n          \"id\": \"Jsfb\",\n          \"type\": \"date\",\n          \"date\": null\n        },\n        \"Cost of next trip\": {\n          \"id\": \"WOd%3B\",\n          \"type\": \"formula\",\n          \"formula\": {\n            \"type\": \"number\",\n            \"number\": null\n          }\n        },\n        \"Recipes\": {\n          \"id\": \"YfIu\",\n          \"type\": \"relation\",\n          \"relation\": []\n        },\n        \"Description\": {\n          \"id\": \"_Tc_\",\n          \"type\": \"rich_text\",\n          \"rich_text\": [\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"A dark green leafy vegetable\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \"A dark green leafy vegetable\",\n              \"href\": null\n            }\n          ]\n        },\n        \"In stock\": {\n          \"id\": \"%60%5Bq%3F\",\n          \"type\": \"checkbox\",\n          \"checkbox\": false\n        },\n        \"Number of meals\": {\n          \"id\": \"zag~\",\n          \"type\": \"rollup\",\n          \"rollup\": {\n            \"type\": \"number\",\n            \"number\": 0,\n            \"function\": \"count\"\n          }\n        },\n        \"Photo\": {\n          \"id\": \"%7DF_L\",\n          \"type\": \"url\",\n          \"url\": null\n        },\n        \"Name\": {\n          \"id\": \"title\",\n          \"type\": \"title\",\n          \"title\": [\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"Tuscan kale\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \"Tuscan kale\",\n              \"href\": null\n            }\n          ]\n        }\n      },\n      \"url\": \"https://www.notion.so/Tuscan-kale-954b67f93f8741db887423b92bbd31ee\"\n    },\n    {\n      \"object\": \"page\",\n      \"id\": \"59833787-2cf9-4fdf-8782-e53db20768a5\",\n      \"created_time\": \"2022-03-01T19:05:00.000Z\",\n      \"last_edited_time\": \"2022-07-06T20:25:00.000Z\",\n      \"created_by\": {\n        \"object\": \"user\",\n        \"id\": \"ee5f0f84-409a-440f-983a-a5315961c6e4\"\n      },\n      \"last_edited_by\": {\n        \"object\": \"user\",\n        \"id\": \"0c3e9826-b8f7-4f73-927d-2caaf86f1103\"\n      },\n      \"cover\": {\n        \"type\": \"external\",\n        \"external\": {\n          \"url\": \"https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg\"\n        }\n      },\n      \"icon\": {\n        \"type\": \"emoji\",\n        \"emoji\": \"🥬\"\n      },\n      \"parent\": {\n        \"type\": \"database_id\",\n        \"database_id\": \"d9824bdc-8445-4327-be8b-5b47500af6ce\"\n      },\n      \"archived\": false,\n      \"properties\": {\n        \"Store availability\": {\n          \"id\": \"%3AUPp\",\n          \"type\": \"multi_select\",\n          \"multi_select\": [\n            {\n              \"id\": \"t|O@\",\n              \"name\": \"Gus's Community Market\",\n              \"color\": \"yellow\"\n            },\n            {\n              \"id\": \"{Ml\\\\\",\n              \"name\": \"Rainbow Grocery\",\n              \"color\": \"gray\"\n            }\n          ]\n        },\n        \"Food group\": {\n          \"id\": \"A%40Hk\",\n          \"type\": \"select\",\n          \"select\": {\n            \"id\": \"5e8e7e8f-432e-4d8a-8166-1821e10225fc\",\n            \"name\": \"🥬 Vegetable\",\n            \"color\": \"pink\"\n          }\n        },\n        \"Price\": {\n          \"id\": \"BJXS\",\n          \"type\": \"number\",\n          \"number\": 2.5\n        },\n        \"Responsible Person\": {\n          \"id\": \"Iowm\",\n          \"type\": \"people\",\n          \"people\": [\n            {\n              \"object\": \"user\",\n              \"id\": \"cbfe3c6e-71cf-4cd3-b6e7-02f38f371bcc\",\n              \"name\": \"Cristina Cordova\",\n              \"avatar_url\": \"https://lh6.googleusercontent.com/-rapvfCoTq5A/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nDKmmUpkpFvWNBzvu9rnZEy7cbl8Q/photo.jpg\",\n              \"type\": \"person\",\n              \"person\": {\n                \"email\": \"cristina@makenotion.com\"\n              }\n            }\n          ]\n        },\n        \"Last ordered\": {\n          \"id\": \"Jsfb\",\n          \"type\": \"date\",\n          \"date\": {\n            \"start\": \"2022-02-22\",\n            \"end\": null,\n            \"time_zone\": null\n          }\n        },\n        \"Cost of next trip\": {\n          \"id\": \"WOd%3B\",\n          \"type\": \"formula\",\n          \"formula\": {\n            \"type\": \"number\",\n            \"number\": 0\n          }\n        },\n        \"Recipes\": {\n          \"id\": \"YfIu\",\n          \"type\": \"relation\",\n          \"relation\": [\n            {\n              \"id\": \"90eeeed8-2cdd-4af4-9cc1-3d24aff5f63c\"\n            },\n            {\n              \"id\": \"a2da43ee-d43c-4285-8ae2-6d811f12629a\"\n            }\n          ],\n\t\t\t\t\t\"has_more\": false\n        },\n        \"Description\": {\n          \"id\": \"_Tc_\",\n          \"type\": \"rich_text\",\n          \"rich_text\": [\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"A dark \",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \"A dark \",\n              \"href\": null\n            },\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"green\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"green\"\n              },\n              \"plain_text\": \"green\",\n              \"href\": null\n            },\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \" leafy vegetable\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \" leafy vegetable\",\n              \"href\": null\n            }\n          ]\n        },\n        \"In stock\": {\n          \"id\": \"%60%5Bq%3F\",\n          \"type\": \"checkbox\",\n          \"checkbox\": true\n        },\n        \"Number of meals\": {\n          \"id\": \"zag~\",\n          \"type\": \"rollup\",\n          \"rollup\": {\n            \"type\": \"number\",\n            \"number\": 2,\n            \"function\": \"count\"\n          }\n        },\n        \"Photo\": {\n          \"id\": \"%7DF_L\",\n          \"type\": \"url\",\n          \"url\": \"https://i.insider.com/612fb23c9ef1e50018f93198?width=1136&format=jpeg\"\n        },\n        \"Name\": {\n          \"id\": \"title\",\n          \"type\": \"title\",\n          \"title\": [\n            {\n              \"type\": \"text\",\n              \"text\": {\n                \"content\": \"Tuscan kale\",\n                \"link\": null\n              },\n              \"annotations\": {\n                \"bold\": false,\n                \"italic\": false,\n                \"strikethrough\": false,\n                \"underline\": false,\n                \"code\": false,\n                \"color\": \"default\"\n              },\n              \"plain_text\": \"Tuscan kale\",\n              \"href\": null\n            }\n          ]\n        }\n      },\n      \"url\": \"https://www.notion.so/Tuscan-kale-598337872cf94fdf8782e53db20768a5\"\n    }\n  ],\n  \"next_cursor\": null,\n  \"has_more\": false,\n  \"type\": \"page_or_database\",\n  \"page_or_database\": {}\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "list"
                    },
                    "results": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "object": {
                            "type": "string",
                            "example": "page"
                          },
                          "id": {
                            "type": "string",
                            "example": "954b67f9-3f87-41db-8874-23b92bbd31ee"
                          },
                          "created_time": {
                            "type": "string",
                            "example": "2022-07-06T19:30:00.000Z"
                          },
                          "last_edited_time": {
                            "type": "string",
                            "example": "2022-07-06T19:30:00.000Z"
                          },
                          "created_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                              }
                            }
                          },
                          "last_edited_by": {
                            "type": "object",
                            "properties": {
                              "object": {
                                "type": "string",
                                "example": "user"
                              },
                              "id": {
                                "type": "string",
                                "example": "ee5f0f84-409a-440f-983a-a5315961c6e4"
                              }
                            }
                          },
                          "cover": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "external"
                              },
                              "external": {
                                "type": "object",
                                "properties": {
                                  "url": {
                                    "type": "string",
                                    "example": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                                  }
                                }
                              }
                            }
                          },
                          "icon": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "emoji"
                              },
                              "emoji": {
                                "type": "string",
                                "example": "🥬"
                              }
                            }
                          },
                          "parent": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "database_id"
                              },
                              "database_id": {
                                "type": "string",
                                "example": "d9824bdc-8445-4327-be8b-5b47500af6ce"
                              }
                            }
                          },
                          "archived": {
                            "type": "boolean",
                            "example": false,
                            "default": true
                          },
                          "properties": {
                            "type": "object",
                            "properties": {
                              "Store availability": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "%3AUPp"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "multi_select"
                                  },
                                  "multi_select": {
                                    "type": "array"
                                  }
                                }
                              },
                              "Food group": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "A%40Hk"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "select"
                                  },
                                  "select": {
                                    "type": "object",
                                    "properties": {
                                      "id": {
                                        "type": "string",
                                        "example": "5e8e7e8f-432e-4d8a-8166-1821e10225fc"
                                      },
                                      "name": {
                                        "type": "string",
                                        "example": "🥬 Vegetable"
                                      },
                                      "color": {
                                        "type": "string",
                                        "example": "pink"
                                      }
                                    }
                                  }
                                }
                              },
                              "Price": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "BJXS"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "number"
                                  },
                                  "number": {}
                                }
                              },
                              "Responsible Person": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "Iowm"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "people"
                                  },
                                  "people": {
                                    "type": "array"
                                  }
                                }
                              },
                              "Last ordered": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "Jsfb"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "date"
                                  },
                                  "date": {}
                                }
                              },
                              "Cost of next trip": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "WOd%3B"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "formula"
                                  },
                                  "formula": {
                                    "type": "object",
                                    "properties": {
                                      "type": {
                                        "type": "string",
                                        "example": "number"
                                      },
                                      "number": {}
                                    }
                                  }
                                }
                              },
                              "Recipes": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "YfIu"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "relation"
                                  },
                                  "relation": {
                                    "type": "array"
                                  }
                                }
                              },
                              "Description": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "_Tc_"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "rich_text"
                                  },
                                  "rich_text": {
                                    "type": "array",
                                    "items": {
                                      "type": "object",
                                      "properties": {
                                        "type": {
                                          "type": "string",
                                          "example": "text"
                                        },
                                        "text": {
                                          "type": "object",
                                          "properties": {
                                            "content": {
                                              "type": "string",
                                              "example": "A dark green leafy vegetable"
                                            },
                                            "link": {}
                                          }
                                        },
                                        "annotations": {
                                          "type": "object",
                                          "properties": {
                                            "bold": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "italic": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "strikethrough": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "underline": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "code": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "color": {
                                              "type": "string",
                                              "example": "default"
                                            }
                                          }
                                        },
                                        "plain_text": {
                                          "type": "string",
                                          "example": "A dark green leafy vegetable"
                                        },
                                        "href": {}
                                      }
                                    }
                                  }
                                }
                              },
                              "In stock": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "%60%5Bq%3F"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "checkbox"
                                  },
                                  "checkbox": {
                                    "type": "boolean",
                                    "example": false,
                                    "default": true
                                  }
                                }
                              },
                              "Number of meals": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "zag~"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "rollup"
                                  },
                                  "rollup": {
                                    "type": "object",
                                    "properties": {
                                      "type": {
                                        "type": "string",
                                        "example": "number"
                                      },
                                      "number": {
                                        "type": "integer",
                                        "example": 0,
                                        "default": 0
                                      },
                                      "function": {
                                        "type": "string",
                                        "example": "count"
                                      }
                                    }
                                  }
                                }
                              },
                              "Photo": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "%7DF_L"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "url"
                                  },
                                  "url": {}
                                }
                              },
                              "Name": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "string",
                                    "example": "title"
                                  },
                                  "type": {
                                    "type": "string",
                                    "example": "title"
                                  },
                                  "title": {
                                    "type": "array",
                                    "items": {
                                      "type": "object",
                                      "properties": {
                                        "type": {
                                          "type": "string",
                                          "example": "text"
                                        },
                                        "text": {
                                          "type": "object",
                                          "properties": {
                                            "content": {
                                              "type": "string",
                                              "example": "Tuscan kale"
                                            },
                                            "link": {}
                                          }
                                        },
                                        "annotations": {
                                          "type": "object",
                                          "properties": {
                                            "bold": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "italic": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "strikethrough": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "underline": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "code": {
                                              "type": "boolean",
                                              "example": false,
                                              "default": true
                                            },
                                            "color": {
                                              "type": "string",
                                              "example": "default"
                                            }
                                          }
                                        },
                                        "plain_text": {
                                          "type": "string",
                                          "example": "Tuscan kale"
                                        },
                                        "href": {}
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "url": {
                            "type": "string",
                            "example": "https://www.notion.so/Tuscan-kale-954b67f93f8741db887423b92bbd31ee"
                          }
                        }
                      }
                    },
                    "next_cursor": {},
                    "has_more": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "type": {
                      "type": "string",
                      "example": "page_or_database"
                    },
                    "page_or_database": {
                      "type": "object",
                      "properties": {}
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 400,\n    \"code\": \"invalid_json\",\n    \"message\": \"Error parsing JSON body.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 400,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "invalid_json"
                    },
                    "message": {
                      "type": "string",
                      "example": "Error parsing JSON body."
                    }
                  }
                }
              }
            }
          },
          "429": {
            "description": "429",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"error\",\n  \"status\": 429,\n  \"code\": \"rate_limited\",\n  \"message\": \"You have been rate limited. Please try again in a few minutes.\"\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 429,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "rate_limited"
                    },
                    "message": {
                      "type": "string",
                      "example": "You have been rate limited. Please try again in a few minutes."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const response = await notion.search({\n    query: 'External tasks',\n    filter: {\n      value: 'database',\n      property: 'object'\n    },\n    sort: {\n      direction: 'ascending',\n      timestamp: 'last_edited_time'\n    },\n  });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl -X POST 'https://api.notion.com/v1/search' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Notion-Version: 2022-06-28' \\\n  --data '{\n    \"query\":\"External tasks\",\n    \"filter\": {\n        \"value\": \"database\",\n        \"property\": \"object\"\n    },\n    \"sort\":{\n      \"direction\":\"ascending\",\n      \"timestamp\":\"last_edited_time\"\n    }\n  }'"
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:60987ed3ca59b8006bcda017"
}
```

---

# Search optimizations and limitations

Optimizations Search works best when the request is as specific as possible. We recommend filtering by object (such as page or database ) and providing a text query to narrow down results. To speed up results, try reducing the page_size . The default page_size is 100. Our implementation of the searc...

## Optimizations

Search works best when the request is as specific as possible. We recommend filtering by object (such as `page` or `database`) and providing a text `query` to narrow down results.

To speed up results, try reducing the `page_size`. The default `page_size` is 100.

Our implementation of the search endpoint includes an optimization where any pages or databases that are directly shared with an integration are guaranteed to be returned. If your use case requires pages or databases to immediately be available in search without an indexing delay, we recommend that you share relevant pages/databases with your integration directly.

## Limitations

The search endpoint works best when it's being used to query for pages and databases by name. It is not optimized for the following use cases:

- **Exhaustively enumerating through all the documents that a bot has access to in a workspace.** Search is not guaranteed to return everything, and the index may change as your integration iterates through pages and databases.
- **Searching or filtering within a particular database.** This use case is much better served by finding the database ID and using the [Query a database](https://developers.notion.com/reference/post-database-query) endpoint.
- **Immediate and complete results.** Search indexing is not immediate. If an integration performs a search quickly after a page is shared with the integration (such as immediately after a user performs OAuth), then the response may not contain the page.
    - When an integration needs to present a user interface that depends on search results, we recommend including a *Refresh* button to retry the search. This will allow users to determine if the expected result is present or not, and give them a way to try again.

---

# List all users

Returns a paginated list of Users for the workspace. The response may contain fewer than page_size of results. Guests are not included in the response. See Pagination for details about how to use a cursor to iterate through the list. Errors Each Public API endpoint can return several possible error ...

Returns a paginated list of [Users](ref:user) for the workspace. The response may contain fewer than `page_size` of results.

Guests are not included in the response.

See [Pagination](https://developers.notion.com/reference/intro#pagination) for details about how to use a cursor to iterate through the list.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

> 📘
>
> The API does not currently support filtering users by their email and/or name.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have user information capabilities. Attempting to call this API without user information capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/users": {
      "get": {
        "summary": "List all users",
        "description": "",
        "operationId": "get-users",
        "parameters": [
          {
            "name": "start_cursor",
            "in": "query",
            "description": "If supplied, this endpoint will return a page of results starting after the cursor provided. If not supplied, this endpoint will return the first page of results.",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page_size",
            "in": "query",
            "description": "The number of items from the full list desired in the response. Maximum: 100",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 100
            }
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{ \"object\": \"list\",\n  \"results\": [\n    {\n      \"object\": \"user\",\n      \"id\": \"d40e767c-d7af-4b18-a86d-55c61f1e39a4\",\n      \"type\": \"person\",\n      \"person\": {\n        \"email\": \"avo@example.org\",\n      },\n      \"name\": \"Avocado Lovelace\",\n      \"avatar_url\": \"https://secure.notion-static.com/e6a352a8-8381-44d0-a1dc-9ed80e62b53d.jpg\",\n    },\n    {\n      \"object\": \"user\",\n      \"id\": \"9a3b5ae0-c6e6-482d-b0e1-ed315ee6dc57\",\n      \"type\": \"bot\",\n      \"bot\": {},\n      \"name\": \"Doug Engelbot\",\n      \"avatar_url\": \"https://secure.notion-static.com/6720d746-3402-4171-8ebb-28d15144923c.jpg\",\n    }\n  ],\n  \"next_cursor\": \"fe2cc560-036c-44cd-90e8-294d5a74cebc\",\n  \"has_more\": true\n}"
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"object\": \"error\",\n    \"status\": 400,\n    \"code\": \"missing_version\",\n    \"message\": \"Notion-Version header failed validation: Notion-Version header should be defined, instead was `undefined`.\"\n }"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "error"
                    },
                    "status": {
                      "type": "integer",
                      "example": 400,
                      "default": 0
                    },
                    "code": {
                      "type": "string",
                      "example": "missing_version"
                    },
                    "message": {
                      "type": "string",
                      "example": "Notion-Version header failed validation: Notion-Version header should be defined, instead was `undefined`."
                    }
                  }
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const response = await notion.users.list();\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/users' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Notion-Version: 2022-06-28\""
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:60913345799af6004f34cc66"
}
```

---

# Retrieve a user

Retrieves a User using the ID specified. Errors Each Public API endpoint can return several possible error codes. See the Error codes section of the Status codes documentation for more information. 📘 Integration capabilities: This endpoint requires an integration to have user information capabiliti...

Retrieves a [User](ref:user) using the ID specified.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

> 📘 Integration capabilities
>
> This endpoint requires an integration to have user information capabilities. Attempting to call this API without user information capabilities will return an HTTP response with a 403 status code. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/users/{user_id}": {
      "get": {
        "summary": "Retrieve a user",
        "description": "",
        "operationId": "get-user",
        "parameters": [
          {
            "name": "user_id",
            "in": "path",
            "description": "Identifier for a Notion user",
            "schema": {
              "type": "string"
            },
            "required": true
          },
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"user\",\n  \"id\": \"d40e767c-d7af-4b18-a86d-55c61f1e39a4\",\n  \"type\": \"person\",\n\t\"person\": {\n\t\t\"email\": \"avo@example.org\",\n\t},\n  \"name\": \"Avocado Lovelace\",\n  \"avatar_url\": \"https://secure.notion-static.com/e6a352a8-8381-44d0-a1dc-9ed80e62b53d.jpg\",\n}"
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const userId = 'd40e767c-d7af-4b18-a86d-55c61f1e39a4';\n  const response = await notion.users.retrieve({ user_id: userId });\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/users/d40e767c-d7af-4b18-a86d-55c61f1e39a4' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Notion-Version: 2022-06-28\""
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:609125e9a7cc490031e956bd"
}
```

---

# Retrieve your token's bot user

Retrieves the bot User associated with the API token provided in the authorization header. The bot will have an owner field with information about the person who authorized the integration. Errors Each Public API endpoint can return several possible error codes. See the Error codes section of the St...

Retrieves the bot [User](ref:user) associated with the API token provided in the authorization header. The bot will have an `owner` field with information about the person who authorized the integration.

### Errors

Each Public API endpoint can return several possible error codes. See the [Error codes section](https://developers.notion.com/reference/status-codes#error-codes) of the Status codes documentation for more information.

> 📘 Integration capabilities
>
> This endpoint is accessible from by integrations with any level of capabilities. The [user object](ref:user) returned will adhere to the limitations of the integration's capabilities. For more information on integration capabilities, see the [capabilities guide](ref:capabilities).

# OpenAPI definition
```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Notion API",
    "version": "1"
  },
  "servers": [
    {
      "url": "https://api.notion.com"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "oauth2",
        "flows": {}
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/v1/users/me": {
      "get": {
        "summary": "Retrieve your token's bot user",
        "description": "",
        "operationId": "get-self",
        "parameters": [
          {
            "name": "Notion-Version",
            "in": "header",
            "description": "The [API version](/reference/versioning) to use for this request. The latest version is `<<latestNotionVersion>>`.",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"object\": \"user\",\n  \"id\": \"16d84278-ab0e-484c-9bdd-b35da3bd8905\",\n  \"name\": \"pied piper\",\n  \"avatar_url\": null,\n  \"type\": \"bot\",\n  \"bot\": {\n    \"owner\": {\n      \"type\": \"user\",\n      \"user\": {\n        \"object\": \"user\",\n        \"id\": \"5389a034-eb5c-47b5-8a9e-f79c99ef166c\",\n        \"name\": \"christine makenotion\",\n        \"avatar_url\": null,\n        \"type\": \"person\",\n        \"person\": {\n          \"email\": \"christine@makenotion.com\"\n        }\n      }\n    }\n  }\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "object": {
                      "type": "string",
                      "example": "user"
                    },
                    "id": {
                      "type": "string",
                      "example": "16d84278-ab0e-484c-9bdd-b35da3bd8905"
                    },
                    "name": {
                      "type": "string",
                      "example": "pied piper"
                    },
                    "avatar_url": {},
                    "type": {
                      "type": "string",
                      "example": "bot"
                    },
                    "bot": {
                      "type": "object",
                      "properties": {
                        "owner": {
                          "type": "object",
                          "properties": {
                            "type": {
                              "type": "string",
                              "example": "user"
                            },
                            "user": {
                              "type": "object",
                              "properties": {
                                "object": {
                                  "type": "string",
                                  "example": "user"
                                },
                                "id": {
                                  "type": "string",
                                  "example": "5389a034-eb5c-47b5-8a9e-f79c99ef166c"
                                },
                                "name": {
                                  "type": "string",
                                  "example": "christine makenotion"
                                },
                                "avatar_url": {},
                                "type": {
                                  "type": "string",
                                  "example": "person"
                                },
                                "person": {
                                  "type": "object",
                                  "properties": {
                                    "email": {
                                      "type": "string",
                                      "example": "christine@makenotion.com"
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {}
                }
              }
            }
          }
        },
        "deprecated": false,
        "security": [],
        "x-readme": {
          "code-samples": [
            {
              "language": "javascript",
              "code": "const { Client } = require('@notionhq/client');\n\nconst notion = new Client({ auth: process.env.NOTION_API_KEY });\n\n(async () => {\n  const response = await notion.users.me();\n  console.log(response);\n})();",
              "name": "Notion SDK for JavaScript"
            },
            {
              "language": "curl",
              "code": "curl 'https://api.notion.com/v1/users/me' \\\n  -H 'Authorization: Bearer '\"$NOTION_API_KEY\"'' \\\n  -H \"Notion-Version: 2022-06-28\""
            }
          ],
          "samples-languages": [
            "javascript",
            "curl"
          ]
        }
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "606ecc2cd9e93b0044cf6e47:615b94166cfcbf0025d4664d"
}
```
