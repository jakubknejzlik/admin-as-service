# admin-as-service

Generated administration for RESTful api.

# Configuration (config.yml)

You define list of entities that should be displayed. These are mapped to api endpoints.

```
title: admin-as-service example
url: <base api url>
oauth: <oauth configuration>
entities:
  companies: # key associated to entity (also mapped to endpoint /{key})
    identifier: id # the field to be used as identifier
    readonly: false # read-only entity doesn't allow mutations
    endpoint: "api/companies" # endpoint for all views of this entity
    listActions: # list of buttons for edit
      - edit # predefined button, redirect to edit form
      - delete # predefined button, delete record
      - title: test # custom created button with redirect action
        icon: new-window
        action: redirect
        url: 'https://www.google.cz/?ei={{entry.values.id}}'
        target: blank
    actions: # actions visible in page header (in list, edit, create screens)
      - create 
      - export
      - filter
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
    label: <label> # human friendly name of field (default: attribute value)
    format: $0,0.00 # formatted number for numeric fields
```

### Choices field (enum/Select)

```
... deprecated, use choice/choices
  fields:
    attribute: state
    type: choice # choice/choices, select is deprecated
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

## Actions configuration

For every page you can configure buttons displayed in header.

```
...
    list:
      actions:
        - title: test
          icon: new-window
          action: redirect
          url: 'https://www.google.cz/?ei={{entry.values.id}}' # you can extract data from entity
          target: blank
        - delete
```

## List actions configuration

The same way you specify page action, you can also specify list actions (buttons in table).

```
...
    list:
      listActions:
        - title: test
          icon: new-window
          action: redirect
          url: 'https://www.google.cz/?ei={{entry.values.id}}' # you can extract data from entity
          target: blank
        - filter
        - edit
        - delete
```

## OAuth configuration

```
oauth:
  flow: resourceOwnerPasswordCredentials
  authorizeUrl: https://api.example.com/authorize
```


## Fullscreen mode

You can also use application in fullscreen mode (only content is display, navigation bar and side menu is hidden).
Application switch to this mode when `fullscreen=true` substring is detected in URL.
