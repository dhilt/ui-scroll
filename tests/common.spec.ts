import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Workflow, Direction, INVALID_DATASOURCE_PREFIX } from 'vscroll';
import { Settings } from 'vscroll/dist/typings/interfaces';

import { UiScrollComponent } from '../src/ui-scroll.component';
import { IAdapter } from '../src/ui-scroll.datasource';

import { configureTestBed, configureTestBedTwo } from './scaffolding/testBed';
import { generateDatasourceClass } from './scaffolding/datasources/class';
import { defaultTemplate } from './scaffolding/templates';
import { Misc } from './miscellaneous/misc';
import { makeTest } from './scaffolding/runner';

describe('Component', () => {

  let misc: Misc;
  let reconfigure = true;

  beforeEach(waitForAsync(() => {
    if (!reconfigure) {
      return;
    }
    reconfigure = false;
    const fixture = configureTestBed(generateDatasourceClass('initial'), defaultTemplate);
    misc = new Misc(fixture);
  }));

  it('should init test component', () => {
    expect(misc.testComponent).toBeTruthy();
  });

  it('should provide datasource', () => {
    expect(misc.datasource).toEqual(jasmine.any(Object));
    expect(misc.datasource.get).toEqual(jasmine.any(Function));
  });

  it('should init ui-scroll', () => {
    expect(misc.uiScrollElement).toBeTruthy();
    expect(misc.uiScrollComponent).toBeTruthy();
  });

  it('should init padding elements', () => {
    expect(misc.padding[Direction.backward].element).toBeTruthy();
    expect(misc.padding[Direction.forward].element).toBeTruthy();
  });

});

describe('Settings', () => {

  const _settings1 = { startIndex: 90 };
  const _settings2 = { bufferSize: 15 };
  const _settings3 = { infinite: true };
  const _settings4 = { startIndex: 99, bufferSize: 11, infinite: true };

  const checkSettings = ({ merge, min }: { merge?: any, min?: string } = {}) => (misc: Misc) => (done: Function) => {
    const _settings = min ? { [min]: -999 } : {};
    const settings = misc.generateFakeWorkflow(_settings).scroller.settings;
    expect(misc.scroller.settings).toEqual(jasmine.any(Object));
    const mergedSettings = { ...settings, ...(merge || {}) };
    Object.keys(settings).filter(key => key !== 'instanceIndex').forEach(key => {
      expect((misc.scroller.settings as any)[key]).toEqual((mergedSettings as any)[key]);
    });
    done();
  };

  makeTest({
    config: { datasourceSettings: _settings1 },
    title: 'should override startIndex',
    it: checkSettings({ merge: _settings1 })
  });

  makeTest({
    config: { datasourceSettings: _settings2 },
    title: 'should override bufferSize',
    it: checkSettings({ merge: _settings2 })
  });

  makeTest({
    config: { datasourceSettings: _settings3 },
    title: 'should override infinite',
    it: checkSettings({ merge: _settings3 })
  });

  makeTest({
    config: { datasourceSettings: _settings4 },
    title: 'should override startIndex, bufferSize, infinite',
    it: checkSettings({ merge: _settings4 })
  });

  makeTest({
    config: { datasourceName: 'default-bad-settings' },
    title: 'should fallback to the defaults',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { startIndex: false } },
    title: 'should fallback startIndex to the default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { bufferSize: { weird: true } } },
    title: 'should fallback bufferSize to the default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { bufferSize: 5.5 } },
    title: 'should fallback bufferSize to the default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { bufferSize: -1 } },
    title: 'should fallback bufferSize to the minimum',
    it: checkSettings({ min: 'bufferSize' })
  });

  makeTest({
    config: { datasourceSettings: { padding: 'something' } },
    title: 'should fallback padding to the default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { padding: -0.1 } },
    title: 'should fallback padding to the minimum',
    it: checkSettings({ min: 'padding' })
  });

  makeTest({
    config: { datasourceSettings: { itemSize: -5 } },
    title: 'should fallback itemSize to the minimum',
    it: checkSettings({ min: 'itemSize' })
  });

  makeTest({
    config: { datasourceSettings: { itemSize: 1.5 } },
    title: 'should fallback itemSize to default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { infinite: 'something' } },
    title: 'should fallback infinite to the default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { horizontal: null } },
    title: 'should fallback horizontal to the default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { viewportElement: { nodeType: 1 } } },
    title: 'should fallback viewportElement to the default',
    it: checkSettings()
  });

  makeTest({
    config: { datasourceSettings: { viewportElement: document.createElement('div') } },
    title: 'should pass HTML element as a value of viewportElement',
    it: ({ scroller: { settings } }: Misc) => (done: Function) => {
      expect(settings.viewportElement).toEqual(settings.viewport);
      const nodeType = settings.viewport ? settings.viewport.nodeType : null;
      expect(nodeType).toEqual(1);
      done();
    }
  });

});

describe('Datasource', () => {

  makeTest({
    config: {
      datasourceClass: 'invalid',
      toThrow: true
    },
    title: 'should throw exception (datasource is not a constructor)',
    it: (error: any) => (done: Function) => {
      expect(error).toBe('datasource is not a constructor');
      done();
    }
  });

  makeTest({
    config: {
      datasourceClass: class {
        settings: Settings;

        constructor() {
          this.settings = {};
        }
      },
      toThrow: true
    },
    title: 'should throw exception (no get)',
    it: (error: string) => (done: Function) => {
      expect(error.startsWith(INVALID_DATASOURCE_PREFIX)).toBeTruthy();
      done();
    }
  });

  makeTest({
    config: {
      datasourceClass: class {
        settings: Settings;
        get: boolean;

        constructor() {
          this.settings = {};
          this.get = true;
        }
      },
      toThrow: true
    },
    title: 'should throw exception (get is not a function)',
    it: (error: string) => (done: Function) => {
      expect(error.startsWith(INVALID_DATASOURCE_PREFIX)).toBeTruthy();
      done();
    }
  });

  makeTest({
    config: {
      datasourceClass: class {
        settings: Settings;

        constructor() {
          this.settings = {};
        }

        get(offset: number) {
          return ++offset;
        }
      },
      toThrow: true
    },
    title: 'should throw exception (get has less than 2 arguments)',
    it: (error: string) => (done: Function) => {
      expect(error.startsWith(INVALID_DATASOURCE_PREFIX)).toBeTruthy();
      done();
    }
  });

  makeTest({
    config: {
      datasourceClass: class {
        settings: Settings;
        test: true;

        constructor() {
          this.settings = {};
        }

        get(offset: number, count: number) {
          return [];
        }
      }
    },
    title: 'should pass',
    it: (error: string) => (done: Function) => done()
  });

});

describe('Workflow', () => {

  let misc: Misc;
  const delay = 1;
  const runBeforeEach = (initDelay: number) =>
    beforeEach(
      () => (
        misc = new Misc(
          configureTestBed(
            generateDatasourceClass(
              'infinite-callback-no-delay',
              { adapter: true },
              { initDelay }
            ),
            defaultTemplate
          )
        )
      )
    );

  describe('Delayed initialization', () => {
    runBeforeEach(delay);

    it('should pass', (done: Function) => {
      const { workflow } = misc;
      expect(workflow.isInitialized).toBe(false);
      setTimeout(() => {
        expect(workflow.isInitialized).toBe(true);
        done();
      }, delay);
    });
  });

  describe('Disposing after delayed initialization', () => {
    runBeforeEach(delay);

    it('should pass', (done: Function) => {
      setTimeout(() => {
        misc.fixture.destroy();
        expect(misc.workflow.isInitialized).toBe(false);
        done();
      }, delay);
    });
  });

  describe('Disposing before delayed initialization', () => {
    runBeforeEach(delay);

    it('should dispose correctly', (done: Function) => {
      misc.fixture.destroy();
      expect(misc.workflow.isInitialized).toBe(false);
      done();
    });
  });

  describe('Disposing after immediate initialization', () => {
    runBeforeEach(0);

    it('should pass', (done: Function) => {
      expect(misc.workflow.isInitialized).toBe(true);
      misc.fixture.destroy();
      expect(misc.workflow.isInitialized).toBe(false);
      done();
    });
  });

});

describe('Multiple Instances', () => {

  let fixture: ComponentFixture<any>;
  let reconfigure = true;
  const getAdapters = (): { a1: IAdapter, a2: IAdapter } => ({
    a1: fixture.componentInstance.datasource.adapter,
    a2: fixture.componentInstance.datasource2.adapter
  });
  const getWorkflows = (): { w1: Workflow, w2: Workflow } =>
    fixture.debugElement.queryAll(By.css('[ui-scroll]'))
      .reduce((acc, element: DebugElement, i: number) => ({
        ...acc,
        ['w' + (i + 1)]: element.componentInstance.workflow
      }), {} as any);


  describe('Initialization', () => {

    beforeEach(waitForAsync(() => {
      if (!reconfigure) {
        return;
      }
      reconfigure = false;
      fixture = configureTestBedTwo();
    }));

    it('should init component with 2 datasources', () => {
      const cmp = fixture.componentInstance;
      expect(cmp).toBeTruthy();
      const ds1 = cmp.datasource;
      const ds2 = cmp.datasource2;
      expect(ds1).toBeTruthy();
      expect(ds2).toBeTruthy();
      const adapter1 = ds1.adapter;
      const adapter2 = ds2.adapter;
      expect(adapter1).toBeTruthy();
      expect(adapter2).toBeTruthy();
    });

    it('should init component with 2 workflows', () => {
      const uiScrollElements: DebugElement[] =
        fixture.debugElement.queryAll(By.css('[ui-scroll]'));
      expect(uiScrollElements).toBeTruthy();
      expect(uiScrollElements.length).toEqual(2);
      uiScrollElements
        .map((element: DebugElement) => element.componentInstance)
        .forEach((component: UiScrollComponent) =>
          expect(component.workflow).toBeTruthy()
        );
    });

    it('should provide 2 live adapters', () => {
      const { a1, a2 } = getAdapters();
      expect(a1.version).toBeTruthy();
      expect(a2.version).toBeTruthy();
      expect(a2.version).toEqual(a1.version);
    });

    it('should provide 2 live workflows', () => {
      const { w1, w2 } = getWorkflows();
      expect(w1.scroller).toBeTruthy();
      expect(w2.scroller).toBeTruthy();
    });

  });

  describe('Subscriptions', () => {

    beforeEach(() => {
      fixture = configureTestBedTwo();
    });

    it('should not interfere', (done) => {
      const { a1, a2 } = getAdapters();
      const { w1, w2 } = getWorkflows();
      let c1 = 0, c2 = 0, count = 0;
      a1.isLoading$.subscribe(value => c1++);
      a2.isLoading$.subscribe(value => c2++);
      const _done = () => {
        if (++count === 2) {
          done();
        }
      };
      spyOn(w1, 'finalize').and.callFake(() =>
        setTimeout(() => {
          expect(c1).toEqual(2);
          _done();
        })
      );
      spyOn(w2, 'finalize').and.callFake(() =>
        setTimeout(() => {
          expect(c2).toEqual(2);
          _done();
        })
      );
    });

  });

});
