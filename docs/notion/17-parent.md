# Parent

Pages , databases , and blocks are either located inside other pages, databases, and blocks, or are located at the top level of a workspace. This location is known as the "parent". Parent information is represented by a consistent parent object throughout the API. General parenting rules: Pages can ...

[Pages](ref:page), [databases](ref:database), and [blocks](ref:block) are either located inside other pages, databases, and blocks, or are located at the top level of a workspace. This location is known as the "parent". Parent information is represented by a consistent `parent` object throughout the API.

General parenting rules:

- Pages can be parented by other pages, databases, blocks, or by the whole workspace.
- Blocks can be parented by pages, databases, or blocks.
- Databases can be parented by pages, blocks, or by the whole workspace.

> 🚧
>
> These parenting rules reflect the possible response you may receive when retrieving information about pages, databases, and blocks via Notion’s REST API. If you are creating new pages, databases, or blocks via Notion’s public REST API, the parenting rules may vary. For example, the parent of a database currently must be a page if it is [created](https://developers.notion.com/reference/create-a-database) via the REST API.
>
> Refer to the API reference documentation for creating [pages](https://developers.notion.com/reference/post-page), [databases](https://developers.notion.com/reference/create-a-database), and [blocks](https://developers.notion.com/reference/patch-block-children) for more information on current parenting rules.

### Database parent

| Property      | Type              | Description                                                       | Example values                           |
| :------------ | :---------------- | :---------------------------------------------------------------- | :--------------------------------------- |
| `type`        | `string`          | Always `"database_id"`.                                           | `"database_id"`                          |
| `database_id` | `string` (UUIDv4) | The ID of the [database](ref:database) that this page belongs to. | `"b8595b75-abd1-4cad-8dfe-f935a8ef57cb"` |

```json Database parent example
{
  "type": "database_id",
  "database_id": "d9824bdc-8445-4327-be8b-5b47500af6ce"
}
```



### Page parent

| Property  | Type              | Description                                               | Example values                           |
| :-------- | :---------------- | :-------------------------------------------------------- | :--------------------------------------- |
| `type`    | `string`          | Always `"page_id"`.                                       | `"page_id"`                              |
| `page_id` | `string` (UUIDv4) | The ID of the [page](ref:page) that this page belongs to. | `"59833787-2cf9-4fdf-8782-e53db20768a5"` |

```json Page parent example
{
  "type": "page_id",
	"page_id": "59833787-2cf9-4fdf-8782-e53db20768a5"
}
```



### Workspace parent

A page with a workspace parent is a top-level page within a Notion workspace. The `parent` property is an object containing the following keys:

| Property    | Type      | Description           | Example values |
| :---------- | :-------- | :-------------------- | :------------- |
| `type`      | `type`    | Always `"workspace"`. | `"workspace"`  |
| `workspace` | `boolean` | Always `true`.        | `true`         |

```json Workspace parent example
{
	"type": "workspace",
	"workspace": true
}
```



### Block parent

A page may have a block parent if it is created inline in a chunk of text, or is located beneath another block like a toggle or bullet block. The `parent` property is an object containing the following keys:

| Property   | Type              | Description                                               | Example values                           |
| :--------- | :---------------- | :-------------------------------------------------------- | :--------------------------------------- |
| `type`     | `type`            | Always `"block_id"`.                                      | `"block_id"`                             |
| `block_id` | `string` (UUIDv4) | The ID of the [page](ref:page) that this page belongs to. | `"ea29285f-7282-4b00-b80c-32bdbab50261"` |

```json Block parent example
{
	"type": "block_id",
	"block_id": "7d50a184-5bbe-4d90-8f29-6bec57ed817b"
}
```

---
