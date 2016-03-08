/*
The MIT License (MIT)

Copyright (c) 2016 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { Peripheral } from 'raspi-peripheral';
import { SerialPort } from 'serialport';

export const DEFAULT_PORT = '/dev/ttyAMA0';

const portId = Symbol('portId');
const options = Symbol('options');
const portInstance = Symbol('portInstance');
const isOpen = Symbol('isOpen');

export class Serial extends Peripheral {

  constructor(port = DEFAULT_PORT, { baudRate = 9600, dataBits = 8, stopBits = 1, parity = 'none' } = {}) {
    const pins = [];
    if (port === DEFAULT_PORT) {
      pins.push('TXD0', 'RXD0');
    }
    super(pins);
    this[portId] = port;
    this[options] = {
      baudRate,
      dataBits,
      stopBits,
      parity
    }
  }

  destroy() {
    this.close();
  }

  open(cb) {
    if (this[isOpen]) {
      setImmediate(cb);
      return;
    }
    this[portInstance] = new SerialPort(this[portId], this[options]);
    this[portInstance].on('open', () => {
      this[portInstance].on('data', (data) => {
        this.emit('data', data);
      });
      this[isOpen] = true;
      cb();
    });
  }

  close(cb) {
    if (!this[isOpen]) {
      setImmediate(cb);
      return;
    }
    this[isOpen] = false;
    this[portInstance].close(cb);
  }

  write(data) {
    if (!this[isOpen]) {
      throw new Error('Attempted to write to a closed serial port');
    }
    this[portInstance].write(data);
  }

}