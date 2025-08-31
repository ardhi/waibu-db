import wdbBase from '../wdb-base.js'

async function btnEdit () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnEdit extends WdbBase {
    build = async () => {
      const { req } = this.component
      const { generateId } = this.plugin.app.bajo
      const { isEmpty, get } = this.app.lib._
      this.params.noTag = true
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('update')) {
        this.params.html = ''
        return
      }
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('edit')
      this.params.attr.color = this.params.attr.color ?? 'secondary-outline'
      this.params.attr.id = generateId('alpha')
      if (!this.params.attr.href) this.params.attr.href = this.component.buildUrl({ base: 'edit', exclude: ['id'] })
      if (this.params.attr.onList) {
        this.params.attr.split = true
        this.params.attr.triggerDisabled = true
        this.params.attr.triggerId = this.params.attr.id
        this.params.attr.triggerTag = 'a'
        this.params.attr['trigger-x-data'] = `{
          path: '${this.params.attr.href}'
        }`
        if (this.params.attr.noClone) {
          this.params.attr['trigger-@on-selection.window'] = `
            const recId = $event.detail[0] ?? ''
            const el = document.getElementById('${this.params.attr.id}')
            if ($event.detail.length === 1) el.classList.remove('disabled')
            else el.classList.add('disabled')
            el.href = path + '&id=' + recId
          `
          this.params.html = await this.component.buildTag({ tag: 'btn', attr: this.params.attr, html: this.params.html })
        } else {
          this.params.attr['trigger-@on-selection.window'] = `
            const recId = $event.detail[0] ?? ''
            const elId = '${this.params.attr.id}'
            for (const id of [elId, elId + '-split']) {
              const el = document.getElementById(id)
              if ($event.detail.length === 1) el.classList.remove('disabled')
              else el.classList.add('disabled')
              const href = path + '&id=' + recId
              if (id.slice(-6) === '-split') {
                const selector = '#' + id.replace('-split', '-menu') + ' a.dropdown-item'
                const item = document.querySelector(selector)
                item.href = href.replace('edit?&id=', 'add?&id=') + '&mode=clone'
              } else el.href = href
            }
          `
          const html = [
            await this.component.buildTag({ tag: 'dropdownItem', attr: { content: req.t('addAsNewClone') } })
          ]
          this.params.attr.triggerColor = this.params.attr.color
          this.params.html = await this.component.buildTag({ tag: 'dropdown', attr: this.params.attr, html: html.join('\n') })
        }
      } else {
        const prefix = this.params.attr.href.includes('?') ? '' : '?'
        this.params.attr.href += prefix + '&id=' + req.query.id
        this.params.html = await this.component.buildTag({ tag: 'btn', attr: this.params.attr, html: this.params.html })
      }
    }
  }
}

export default btnEdit
