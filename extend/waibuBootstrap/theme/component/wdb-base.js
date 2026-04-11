async function wdbBase () {
  return class WdbBase extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      const { getModel } = this.app.dobo
      const { get } = this.app.lib._
      this.schema = get(this, 'component.locals.schema', {})
      this.formData = get(this, 'component.locals.form', {})
      this.model = getModel(this.schema.name, true)
    }

    getRef = ({ field, refName, returning } = {}) => {
      const { get } = this.app.lib._
      if (!this.model) return {}
      const prop = this.model.getProperty(field)
      if (!prop) return {}
      if (!refName && field.endsWith('Id')) refName = field.slice(0, -2)
      const key = this.params.attr.refName ?? refName
      const ref = get(prop, `ref.${key}`, {})
      if (returning === 'all') return { ref, key }
      else if (returning === 'key') return key
      return ref
    }

    getRefValue = ({ field, data, labelField, refName } = {}) => {
      const { get, isEmpty } = this.app.lib._
      const { ref, key } = this.getRef({ field, refName, returning: 'all' })
      if (isEmpty(ref)) return undefined
      labelField = labelField ?? ref.labelField ?? 'id'
      return (get(data ?? this.formData, `_ref.${key}.${labelField}`))
    }

    getRefName = (field) => {
      const { get } = this.app.lib._
      let refName = get(this.schema, `view.widget.${field}.attr.ref-name`, this.params.attr.refName)
      if (!refName && this.params.attr[field] && this.params.attr[field].endsWith('Id')) refName = this.params.attr[field].slice(0, -2)
      return refName
    }

    getSetting = (key, defaultValue) => {
      const { req } = this.component
      const { get, camelCase } = this.app.lib._
      const widgetName = camelCase(this.constructor.name)
      key = key.replaceAll('{self}', widgetName)
      const config = req.getSetting(`${this.plugin.ns}:${key}`, defaultValue)
      return get(this.schema, `view.${key}`, config)
    }
  }
}

export default wdbBase
