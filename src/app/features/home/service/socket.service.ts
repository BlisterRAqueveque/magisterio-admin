import { USER_COOKIE_KEY } from '@/app/core';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  constructor(private readonly cookieService: CookieService) {}

  private socket: Socket | undefined;

  private isConnected = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnected.asObservable();

  /**
   * @description Connect the socket with the given token
   */
  connectSocket(url: string) {
    const token = this.cookieService.get(USER_COOKIE_KEY);
    try {
      this.socket = io(url, {
        extraHeaders: {
          authorization: token,
        },
      });

      this.socket.on('connect', () => {
        console.log('SOCKET', 'Connected to server');
        this.isConnected.next(true);
      });

      this.socket.on('disconnect', () => {
        console.log('SOCKET', 'Disconnected from server');
        this.isConnected.next(false);
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @description Disconnect the socket
   */
  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  listen(event: string): Observable<any> {
    return new Observable((obs) => {
      if (this.socket)
        this.socket.on(event, (data: any) => {
          obs.next(data);
        });
    });
  }

  /**
   * @description Send the event message to the server
   * @param event Server event name
   * @param data Data to send
   */
  emit(event: string, data: any) {
    this.socket!.emit(event, data);
  }

  private ngOnDestroy(): void {
    this.disconnectSocket();
  }
}
