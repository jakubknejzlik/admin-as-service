# admin-as-service

Generated administration for RESTful api.

# Configuration (config.yml)

You define list of entities that should be displayed. These are mapped to api endpoints.

```
entities:
  companies: # key associated to entity (also mapped to endpoint /{key})
    name: Company # entity name displayed in menu item/titles
    fields: # default list of fields
      - <field configuration>
    list: # configuration of list page
      title: This is list page
      filters:
        - <filter configuration>
      fields: # fields for list page only
        - <field configuration>
    create: # configuration of create page
      title: Create new item
      fields: # fields for create page only
        - <field configuration>
    edit: # configuration of edit page
      title: Edit existing item
      fields: # fields for edit page only
        - <field configuration>
```

## Field configuration

Each field is described by object with following structure:

```
...
  fields:
    attribute: <columnName>
    type: string # type of field (string, text, date, select, reference)
```

### Select field (enum)

```
...
  fields:
    attribute: state
    type: select
    options:
      - { value: US, label: USA }
      - { value: FR, label: France }
```

### Reference field

```
...
  fields:
    attribute: user_id
    type: reference
    toMany: false
    entity: <entity key> # eg. companies
    targetField: name # field to be displayed in displayed reference (companies.name)
```

## Filters configuration

For list you can configure filtering as list of filters:

```
...
    list:
      filters:
        q: # query string attribute that will be mapped ?q={value}
          label: Search
          pinned: true # specify if the search is always displayed
          attributes:
            placeholder: search text
            searchColumns: title # specify on which columns the filter should be applied
        where[user_id]: # query string attribute that will be mapped ?where[user_id]={value}
          label: User
          type: reference
          entity: users
          targetField: firstname
```
