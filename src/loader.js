class Loader {

  activate(loading) {
    console.warn('activate not set');
  }

  deactivate() {
    console.warn('deactivate not set');
  }

  progress() {
    console.warn('progress not set');
  }
  
  set loading(loading) {
    if (loading) {
      this.activate(loading);
    } else {
      this.deactivate();
    }
  }
}

export const LOADER = new Loader();