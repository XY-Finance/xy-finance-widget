import queryString from 'query-string';
import { Config, Orientation } from './types/config'

export class XYFinaceWidget {
  private static iframeId = 'xy-finance-iframe';
  private static rootId = 'xy-finance-widget-root';
  private static placeholderId = 'xy-finance-placeholder';

  private static sizes = {
    portrait: {
      height: 812,
      width: 480
    },
    landscape: {
      height: 439,
      width: 832
    }
  }

  private orientation: Orientation;

  private isWidgetIntoViewport: boolean;

  private resizeObserver: ResizeObserver;

  private static breakpoint = 832;
  private config: Config = {
    fromTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    sourceChainId: '1',
    toTokenAddress: '0x77777777772cf0455fB38eE0e75f38034dFa50DE',
    targetChainId: '1',
    amount: 1,
    slippage: '1',
    orientation: 'portrait',
    theme: 'dark',
    lockmode: 'none',
    pagecolor: null    
  }

  private get root(): HTMLElement | null {
      return document.getElementById(XYFinaceWidget.rootId);
  }

  private get iframe(): HTMLElement | null {
      return document.getElementById(XYFinaceWidget.iframeId);
  }

  private get placeholder(): HTMLElement | null {
      return document.getElementById(XYFinaceWidget.placeholderId);
  }

  constructor() {
    (<any>window).onFrameLoad = () => {
      this.iframe!.style.display = 'block';
      this.placeholder!.remove();
      setTimeout(() => this.onViewportChange(true), 5000);
    }

    const fadeinAnimation = `
      <style>
        @keyframes fadein {
            0%   { opacity:1; }
            50%  { opacity:0.3; }
            100% { opacity:1; }
        }
      </style>
    `;

    const rootStyles = `
      <style>
        #${XYFinaceWidget.rootId} {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }
      </style>
    `

    this.addStyle([fadeinAnimation, rootStyles]);
  }

  public init(config: Config = this.config, initialize = true): void {
    if (!config) {
        config = this.config;
    } else {
        this.checkConfig(config);
        this.config = config;
    }
    const root = this.tryGetRoot();
    this.iframe?.remove()
    this.placeholder?.remove()

    setTimeout(() => {
      if (config && initialize && config.orientation !== 'portrait' && config.orientation !== 'landscape') {
        this.disable();
        this.addViewportChangeListener();
        this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
        this.resizeObserver.observe(root);
      }

      let { orientation, ...parameters } = config;
      const type = this.getOrientation();
      this.orientation = type;
      const device = window.innerWidth < 600 ? 'mobile' : 'desktop';
      parameters = {
          ...parameters,
          device
      } as any;

      const query = queryString.stringify(parameters).replaceAll('&', '&amp;');
      const bgColor = config.theme === 'light' ? '#EEEEEE' : '#14171a';

      const iframeNode = `
      <div id="xy-finance-placeholder" style="
          height: ${XYFinaceWidget.sizes[type].height}px;
          width: ${XYFinaceWidget.sizes[type].width}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px; 
          box-shadow: 3px 3px 10px 4px rgba(0, 0, 0, 0.1);
          background-color: ${bgColor};
      ">
        <svg width="100" height="100" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C31.0457 0 40 8.95428 40 20L39.9973 20.3307C39.8207 31.2239 30.9353 40 20 40L19.867 39.9996C15.4799 39.971 11.4287 38.5289 8.1442 36.1073L34.4129 10.1845H26.3735L20.2519 16.1004L17.5429 13.4061H6.80331L14.8281 21.4508L4.06728 32.0889L3.99104 31.9879C1.48542 28.6472 0 24.4973 0 20L0.00267944 19.6693C0.179296 8.77609 9.0648 0 20 0ZM25.8337 21.6066L20.4273 26.8527L23.1123 29.5205L33.8645 29.5225L25.8337 21.6066Z" fill="url(#paint0_radial_10365_20726)"/>
          <defs>
            <radialGradient id="paint0_radial_10365_20726" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36 3.5) rotate(135) scale(48.7904)">
              <stop stop-color="#14C5E4"/>
              <stop offset="0.63" stop-color="#0D58EF"/>
              <stop offset="1" stop-color="#100E75"/>
            </radialGradient>
          </defs>
        </svg>
      </div>
      <iframe
          id="xy-finance-iframe"
          title="XY-Finance Widget"
          height="${XYFinaceWidget.sizes[type].height}"
          width="${XYFinaceWidget.sizes[type].width}"
          style="border: none; border-radius: 29px; box-shadow: 3px 3px 10px 4px rgba(0, 0, 0, 0.1); display: none;"
          src="${process.env.BASE_URL}/?orientation=${type}${query ? '&amp;' + query : ''}"
          onload="onFrameLoad()"
          allow="clipboard-read; clipboard-write; usb; bluetooth"
      >
      </iframe>
      `;

      root.insertAdjacentHTML('afterbegin', iframeNode);
    })
  }

  public disable() {
      removeEventListener('DOMContentLoaded',this.onViewportChange, false);
      removeEventListener('load', this.onViewportChange, false);
      removeEventListener('scroll', this.onViewportChange, false);
      this.resizeObserver?.disconnect();
  }

  private onResize(): void {
      setTimeout(() => {
          if (this.config.orientation !== 'portrait' && this.config.orientation !== 'landscape') {
              const rootWidth = this.root.getBoundingClientRect().width;
              if (
                  (this.orientation === 'portrait' && rootWidth >= XYFinaceWidget.breakpoint) ||
                  (this.orientation === 'landscape' && rootWidth < XYFinaceWidget.breakpoint)
              ) {
                  this.init(null, false);
              } else {
                  setTimeout(this.onViewportChange);
              }
          }
      });
  }

  private getOrientation(): Orientation {
      const { orientation } = this.config;
      let type: Orientation;
      if (orientation === 'landscape' || orientation == 'portrait') {
        type = orientation;
      } else {
        const positionInfo = this.root!.getBoundingClientRect();
        type = positionInfo.width < XYFinaceWidget.breakpoint ? 'portrait' : 'landscape';
      }

      return 'portrait';
  }


  private tryGetRoot(): HTMLElement {
      const root = this.root;
      if (!root) {
          console.error(`[XYFINANCE WIDGET] You should place <div id="${XYFinaceWidget.rootId}"></div> into <body></body>`);
          throw new Error(`You should place <div id="${XYFinaceWidget.rootId}"></div> into <body></body>`);
      }

      return root;
  }

  private addStyle(style: string | string[]) {
      if (Array.isArray(style)) {
          style.forEach(item => document.head.insertAdjacentHTML("beforeend", item))
          return;
      }
      document.head.insertAdjacentHTML("beforeend", style);
  }

  private addViewportChangeListener() {
      addEventListener('DOMContentLoaded',this.onViewportChange, false);
      addEventListener('load', this.onViewportChange, false);
      addEventListener('scroll', this.onViewportChange, false);
  }

  private onViewportChange = (force?: boolean | unknown) => {
      const root = this.tryGetRoot();
      const iframe = root.querySelector('iframe');
      if (!iframe || iframe?.style.display === 'none') {
        return;
      }

      const isWidgetIntoViewport = XYFinaceWidget.isElementInViewport(iframe);
      if (this.isWidgetIntoViewport === isWidgetIntoViewport && force !== true) {
          return;
      }

      this.isWidgetIntoViewport = isWidgetIntoViewport;
      const msg = {
          name: 'widget-into-viewport',
          widgetIntoViewport: isWidgetIntoViewport
      }
      try {
          iframe.contentWindow.postMessage(msg, `https://${process.env.API_BASE_URL}`)
      } catch (e) {
          console.debug(e);
      }
  }

  private static isElementInViewport(element: HTMLElement) {
      const box = element.getBoundingClientRect();

      return (
          box.bottom > 0 &&
          box.right > 0 &&
          box.top < (window.innerHeight || document.documentElement.clientHeight) &&
          box.left < (window.innerWidth || document.documentElement.clientWidth)
      );
  }

  private checkConfig(config: Config) {
    if (!config.fromTokenAddress || !config.toTokenAddress || !config.sourceChainId || !config.targetChainId) {
      console.error(
        '[XYFINANCE WIDGET] ERROR: you need to provide fromTokenAddress, toTokenAddress, sourceChainId, targetChainId'
      )
    }
  }
}
