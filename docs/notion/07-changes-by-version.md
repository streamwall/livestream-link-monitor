# Changes by version

Version Breaking changes 2022-06-28 Page properties must be retrieved using the page properties endpoint. Parents are now always direct parents; a parent field has been added to block. Database relations have a type of single_property and dual_property . See changelog for more details. 2022-02-22 Se...

[block:parameters]
{
  "data": {
    "h-0": "Version",
    "h-1": "Breaking changes",
    "0-1": "Page properties must be retrieved using the page properties endpoint.\n\nParents are now always direct parents; a parent field has been added to block.\n\nDatabase relations have a type of `single_property` and `dual_property`.\n\nSee [changelog](https://developers.notion.com/changelog/releasing-notion-version-2022-06-28) for more details.",
    "0-0": "`2022-06-28`",
    "3-1": "Rich text property values use the type `rich_text` instead of `text`.\n\n[Migration details](changelog:unversioned-requests-no-longer-accepted)",
    "3-0": "`2021-05-13`",
    "2-0": "`2021-08-16`",
    "2-1": "The [Append block children](ref:patch-block-children) endpoint returns a list of new [Block object](ref:block) children instead of the parent block.\n\n Array rollup property types changed from `file`, `text` and `person` to `files`, `rich_text` and `people`.\n\nProperty IDs are now encoded to be URL safe.\n\nEmpty number, email, select, date, and rollup properties are now returned in page responses as `null`.\n\n[More information](changelog:notion-version-2021-08-16)",
    "1-0": "`2022-02-22`",
    "1-1": "See [changelog](https://developers.notion.com/changelog/releasing-notion-version-2022-02-22)."
  },
  "cols": 2,
  "rows": 4
}
[/block]

---
