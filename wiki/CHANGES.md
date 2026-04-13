# Changes

## 2026-04-13

- [2.16.0] Add ```oldData``` propety to ```WdbBase``` widget
- [2.16.0] Change ```WdbBase.getSetting()``` to also respect setting from ```waibu.getSetting()```
- [2.16.0] Rewrite ```WdbForm``` widget entirely
- [2.16.0] Remove redundant call to get old record in ```updateRecord()```

## 2026-04-11

- [2.15.0] Add ```control``` key in config object
- [2.15.0] Bug fix in ```formatRow()```
- [2.15.0] Add ```WdbBase.getRefName()```
- [2.15.0] Add ```WdbBase.getSetting()```
- [2.15.0] Update placeholder in ```WdbQuery``` based on model's ```scanables``` values
- [2.15.0] ```getSchemaExt()``` now support ```format```, ```formatValue``` and ```formatCell```
- [2.15.0] All default handlers now support ```options.formatValue``` and ```options.retainOriginalValue````

## 2026-04-07

- [2.14.0] Add ```wdb-lookup-select``` widget
- [2.14.0] Add ```WdbBase.getRef()```
- [2.14.0] Add ```WdbBase.getRefValue()```
- [2.14.0] Rewrite necessary changes to use dobo's new lookup mechanism through model references


## 2026-04-02

- [2.12.6] Bug fix in ```wdb-query``` widget
- [2.13.0] Add warnings template
- [2.13.0] Changes in all crud handlers, now the first parameter is an object of ```req``` and ```model```
- [2.13.0] Bug fix in ```wdb-form``` widget

## 2026-04-01

- [2.12.5] Bug fix in ```wdb-btn-column``` widget
- [2.12.5] Bug fix in ```wdb-pagination``` widget
- [2.12.5] Bug fix in ```wdb-query``` widget
- [2.12.5] Bug fix in ```wdb-recs-info``` widget
- [2.12.5] Bug fix in ```wdb-table``` widget
- [2.12.5] Bug fix in remove attachment

## 2026-03-30

- [2.12.3] Bug fix in transaction supports
- [2.12.4] Bug fix in ```options.limit```, removed due to use ```findAllRecords()```

## 2026-03-27

- [2.12.1] Bug fix in all ```view.format``` & ```view.formatValue```
- [2.12.2] Bug fix in ```wdb-form``` & ```wdb-table``` widgets, now correctly use value from format if provided

## 2026-03-26

- [2.11.0] Adding ```suppressError``` to model options
- [2.12.0] ```suppressError``` can now be either one or more actions. If set to ```true```, it assumed to be all actions
- [2.12.0] Print error log even in ```suppressError```

## 2026-03-25

- [2.10.3] Bug fix in ```getOneRecord()```

## 2026-03-22

- [2.10.1] Bug fix in reference records
- [2.10.2] Bug fix in ```wdb-btn-edit``` widget

## 2026-03-19

- [2.10.0] Data value tooltip can now be turned off with ```no-data-value-ref```

## 2026-03-15

- [2.9.0] Add ability to overwrite ```base``` through ```options```
- [2.9.0] Bug fix in ```wdb-btn-columns``` widget
- [2.9.0] Bug fix in ```wdb-table``` widget

## 2026-03-08

- [2.8.1] Bug fix in ```build-params.js```
- [2.8.2] Bug fixes for record not found
- [2.8.3] Compine all helpers into one single file ```helper.js```

## 2026-03-05

- [2.8.0] Add dobo's transaction support

## 2026-02-22

- [2.7.1] Bug fix in query parser

## 2026-02-20

- [2.7.0] Update ```WdbBtnColumns``` to allow untick ID field too
- [2.7.0] Bug fix in theme & iconset resolver
- [2.7.0] Add capability to set value from ```prop.values``` in ```WdbTable```
- [2.7.0] Bug fix in query builder
- [2.7.0] Add capability to handle value from ```prop.values``` in ```getSchemaExt()```

## 2026-02-18

- [2.6.0] Update attribute functions from ```waibu```
- [2.6.0] Bug fix in ```getSchemaExt()```'s ```applyLayout()```
- [2.6.1] Bug fix in ```getSchemaExt()```

## 2026-02-15

- [2.5.0] Add ```findAllRecord()```

## 2026-02-08

- [2.4.0] Add ```timeZone``` options in ```formatRow()```

## 2026-02-04

- [2.3.2] Bug fix in ```detailsHandler()```
- [2.3.2] Bug fix in ```getOneRecord()```
- [2.3.3] Bug fix in calling ```getOneRecord()``` without scope

## 2026-02-03

- [2.3.1] Bug fix in widget menu direction
- [2.3.1] Bug fix in widget's fields visibility

## 2026-01-30

- [2.3.0] Record ID that passed to ```getRecord()```, ```removeRecord()```, ```updateRecord()``` now get screened first against auto query produced by ```req``` object

## 2026-01-24

- [2.2.2] Remove annoying console.log trap

## 2026-01-24

- [2.2.0] Model's option can now be sent through ```modelOpts``` object in ```options``` handler
- [2.2.0] ```prepCrud()``` now accept model instance or model name only
- [2.2.0] ```getSchemaExt``` now accept model instance or model name only

## 2026-01-21

- [2.1.7] Bug fix in page titles

## 2026-01-19

- [2.1.6] Bug fix in app title
- [2.1.6] Add some missing translations

## 2026-01-17

- [2.1.4] Bug fix
- [2.1.5] Add capability to set custom theme & iconset through headers

## 2026-01-16

- [2.1.2] Bug fix in model references

## 2026-01-13

- [2.1.1] Bug fix in waibuMpa's widgeting system

## 2025-12-28

- [2.1.0] Ported to ```bajo@2.2.x``` & ```dobo@2.2.x``` specs