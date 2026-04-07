async function wdbBase () {
  return class WdbBase extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      const { getModel } = this.app.dobo
      const { get } = this.app.lib._
      this.schema = get(this, 'component.locals.schema', {})
      this.formData = get(this, 'component.locals.form', {})
      this.model = getModel(this.schema.name)
    }

    getRef = ({ field, refName, returning } = {}) => {
      const { get } = this.app.lib._
      if (!this.schema) return {}
      const prop = this.model.getProperty(field)
      if (!prop) return {}
      refName = refName ?? this.params.attr['x-ref'] ?? field.slice(0, -2)
      const key = this.params.attr.refName ?? refName
      const ref = get(prop, `ref.${key}`, {})
      if (returning === 'all') return { ref, key }
      else if (returning === 'key') return key
      return ref
    }

    getRefValue = ({ field, data, labelField, refName } = {}) => {
      const { isEmpty } = this.app.lib._
      const { ref, key } = this.getRef({ field, refName, returning: 'all' })
      if (isEmpty(ref)) return undefined
      labelField = labelField ?? ref.labelField ?? 'id'
      return (data ?? this.formData)._ref[key][labelField]
    }
  }
}

export default wdbBase
