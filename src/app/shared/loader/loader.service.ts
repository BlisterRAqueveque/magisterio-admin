import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  inject,
} from '@angular/core';
import { LoaderComponent } from './loader.component';

@Injectable()
export class LoaderService {
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  private componentRef!: ComponentRef<unknown>;

  present() {
    // 1. Create a component reference from the component
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(LoaderComponent)
      .create(this.injector);

    //Instancias del componente
    //(this.componentRef.instance as LoaderComponent).src = src;

    // const componentRef = this.viewContainerRef.createComponent(component);

    // 2. Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(this.componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    document.body.appendChild(domElem);
  }

  dismiss() {
    this.appRef.detachView(this.componentRef.hostView);
    (this.componentRef as any).show = false;
    setTimeout(() => {
      this.componentRef.destroy();
    }, 5000);
  }
}
