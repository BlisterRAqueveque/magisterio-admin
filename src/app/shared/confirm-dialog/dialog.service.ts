import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  inject,
} from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable()
export class DialogService {
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  private componentRef!: ComponentRef<unknown>;

  present(header: string, message: string, fx: Function) {
    // 1. Create a component reference from the component
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ConfirmDialogComponent)
      .create(this.injector);

    //Instancias del componente
    //(this.componentRef.instance as any).src = src;
    (this.componentRef.instance as any).header = header;
    (this.componentRef.instance as any).message = message;
    (this.componentRef.instance as any).fx = fx;

    // const componentRef = this.viewContainerRef.createComponent(component);

    // 2. Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(this.componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    document.body.appendChild(domElem);
  }

  confirmAction(header: string, message: string, fx: Function) {
    // 1. Create a component reference from the component
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ConfirmDialogComponent)
      .create(this.injector);

    //Instancias del componente
    //(this.componentRef.instance as any).src = src;
    (this.componentRef.instance as ConfirmDialogComponent).header = header;
    (this.componentRef.instance as ConfirmDialogComponent).message = message;
    (this.componentRef.instance as ConfirmDialogComponent).fx = fx;
    (this.componentRef.instance as ConfirmDialogComponent).haveConfirmButton =
      false;

    // const componentRef = this.viewContainerRef.createComponent(component);

    // 2. Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(this.componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    document.body.appendChild(domElem);
  }

  error(header: string, message: string, fx: Function) {
    // 1. Create a component reference from the component
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ConfirmDialogComponent)
      .create(this.injector);

    //Instancias del componente
    //(this.componentRef.instance as any).src = src;
    (this.componentRef.instance as ConfirmDialogComponent).header = header;
    (this.componentRef.instance as ConfirmDialogComponent).message = message;
    (this.componentRef.instance as ConfirmDialogComponent).fx = fx;
    (this.componentRef.instance as ConfirmDialogComponent).error = true;
    (this.componentRef.instance as ConfirmDialogComponent).haveConfirmButton =
      false;

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
    this.componentRef.destroy();
  }
}
