import React from 'react';
import { render, screen } from '@testing-library/react';
import {checkHostFormat} from './Signin';

test('valid host', () => {
  let [ok, host, port] = checkHostFormat('example.com:2233')
  expect(ok).toBe(true);
  expect(host).toBe("example.com");
  expect(port).toBe(2233);
});

test('valid host', () => {
  let [ok, host, port] = checkHostFormat('127.0.0.1:2233')
  expect(ok).toBe(true);
  expect(host).toBe("127.0.0.1");
  expect(port).toBe(2233);
});

test('valid host', () => {
  let [ok, host, port] = checkHostFormat('127.0.0.1')
  expect(ok).toBe(true);
  expect(host).toBe("127.0.0.1");
  expect(port).toBe(22);
});

test('valid host', () => {
  let [ok, host, port] = checkHostFormat('example.com')
  expect(ok).toBe(true);
  expect(host).toBe("example.com");
  expect(port).toBe(22);
});

test('valid host', () => {
  let [ok, host, port] = checkHostFormat('example.com:')
  expect(ok).toBe(false);
});

test('valid host', () => {
  let [ok, host, port] = checkHostFormat('example.com:t')
  expect(ok).toBe(false);
});

test('ipv6 host', () => {
  let [ok, host, port] = checkHostFormat('0:1:2:3:4:5:6:7:8')
  expect(ok).toBe(true);
  expect(host).toBe("0:1:2:3:4:5:6:7:8");
  expect(port).toBe(22);
});

test('ipv6 host', () => {
  let [ok, host, port] = checkHostFormat('0::3:4:5:6:7:8')
  expect(ok).toBe(true);
  expect(host).toBe("0::3:4:5:6:7:8");
  expect(port).toBe(22);
});

test('ipv6 host', () => {
  let [ok, host, port] = checkHostFormat('[0::3:4:5:6:7:8]')
  expect(ok).toBe(true);
  expect(host).toBe("0::3:4:5:6:7:8");
  expect(port).toBe(22);
});

test('ipv6 host', () => {
  let [ok, host, port] = checkHostFormat('[0::3:4:5:6:7:8]:2222')
  expect(ok).toBe(true);
  expect(host).toBe("0::3:4:5:6:7:8");
  expect(port).toBe(2222);
});

test('ipv6 host', () => {
  let [ok, host, port] = checkHostFormat('[0::3:4:5:6:7:8]:')
  expect(ok).toBe(false);
});

test('ipv6 host', () => {
  let [ok, host, port] = checkHostFormat('[0::3:4:5:6:7:8]:h')
  expect(ok).toBe(false);
});
