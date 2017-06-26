class Loader {

  activate() {
    console.warn('activate not set');
  }

  deactivate() {
    console.warn('deactivate not set');
  }
  
  set loading(loading) {
    if (loading) {
      this.activate();
    } else {
      this.deactivate();
    }
  }
}

export const LOADER = new Loader();