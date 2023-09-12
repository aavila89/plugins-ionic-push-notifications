import { Component, OnInit } from '@angular/core';
import { Device } from '@capacitor/device';
import {PushNotifications, Token, PermissionStatus, PushNotificationSchema, ActionPerformed} from '@capacitor/push-notifications';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    const info = await Device.getInfo();
    if (info.platform !== 'web') {
      this.registerPush();
    }
  }

  private registerPush() {
    PushNotifications.requestPermissions().then((permission: PermissionStatus) => {
      if (permission.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register().then();
      } else {
        // No permission for push granted
      }
    });

    PushNotifications.addListener(
      'registration',
      async (token: Token) => {
          //TODO:THE TOKEN IS RECEIVED AFTER A SUCCESSFUL AUTHENTICATION IS ACHIEVED
          console.log('My token: ' + JSON.stringify(token));
      }
    );

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
         //TODO: THIS IS WHERE THE NOTIFICATION IS CAPTURED (BACKGROUND)
        console.log('Push received: ' + JSON.stringify(notification));
        this.presentAlert('Notification in Background', notification.body);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
         //TODO: THIS IS WHERE TAB THE NOTIFICATION IS FOREGROUND
        const data = notification.notification.data;
        this.presentAlert('Notification in Foreground', data.body);
        console.log('Action performed: ' + JSON.stringify(notification.notification));
      }
    );
  }

  async presentAlert(title?: string, message?: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

}
