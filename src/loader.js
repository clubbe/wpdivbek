class Loader {

  constructor() {
      this.isLoading = false;
  }

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
      this.isLoading = true;
      this.activate(loading);
    } else {
      this.isLoading = false;
      this.deactivate();
    }
  }
}

export const LOADER = new Loader();