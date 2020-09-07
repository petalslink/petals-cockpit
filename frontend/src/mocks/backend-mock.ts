/**
 * Copyright (C) 2017-2020 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export const CORRECT_SETUP_TOKEN = 'CORRECT_SETUP_TOKEN';
export const GONE_SETUP_TOKEN = 'GONE_SETUP_TOKEN';
export const BAD_SETUP_USER = 'BAD_SETUP_USER';

export const ADD_WKS_HTTP_ERROR_BACKEND = 'ADD_WKS_HTTP_ERROR_BACKEND';
export const UPDATE_WKS_HTTP_ERROR_BACKEND = 'UPDATE_WKS_HTTP_ERROR_BACKEND';

export const FAST_IMPORT_OK_IP = 'FAST_IMPORT_OK_IP';
export const FAST_IMPORT_ERROR_IP = 'FAST_IMPORT_ERROR_IP';

export const IMPORT_OK_IP = 'IMPORT_OK_IP';
export const IMPORT_ERROR_IP = 'IMPORT_ERROR_IP';
export const IMPORT_CANCEL_IP = 'IMPORT_CANCEL_IP';

export const IMPORT_HTTP_ERROR_IP = 'IMPORT_HTTP_ERROR_IP';
export const IMPORT_HTTP_ERROR_IP_LONG_TEXT = 'IMPORT_HTTP_ERROR_IP_LONG_TEXT';
export const errorBackend = `Error backend`;
export const errorBackendLongText = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi`;

// buses that can be imported
export const validContainers = [
  '192.168.0.1:7700',
  'localhost:7700',
  `${IMPORT_CANCEL_IP}:7700`,
  `${FAST_IMPORT_OK_IP}:7700`,
  `${IMPORT_OK_IP}:7700`,
];
