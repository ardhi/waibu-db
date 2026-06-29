async function wdbBase () {
  return class WdbBase extends this.app.baseClass.MpaWidget {
    isActionAllowed = async (action) => {
      const { req } = this.component
      if (!this.app.sumba || !this.model) return true
      return await this.app.sumba.isActionAllowed(action, this.model, req)
    }
  }
}

export default wdbBase
