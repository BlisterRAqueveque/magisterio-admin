import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  TemplateRef,
  inject,
} from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable()
export class ModalService {
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  private componentRef!: ComponentRef<unknown>;

  present(header: string, body: TemplateRef<any>, footer: TemplateRef<any>) {
    // 1. Create a component reference from the component
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ModalComponent)
      .create(this.injector);

    //Instancias del componente
    //(this.componentRef.instance as any).src = src;
    (this.componentRef.instance as ModalComponent).header = header;
    (this.componentRef.instance as ModalComponent).body = body;
    (this.componentRef.instance as ModalComponent).footer = footer;
    (this.componentRef.instance as ModalComponent).componentRef =
      this.componentRef;

    // 2. Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(this.componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    document.body.appendChild(domElem);

    return this.componentRef;
  }

  dismiss(componentRef: ComponentRef<unknown>) {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
