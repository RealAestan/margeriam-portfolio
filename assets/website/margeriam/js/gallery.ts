import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
import 'photoswipe/dist/photoswipe.css';
// Skin CSS file (styling of UI - buttons, caption, etc.)
//      In the folder of skin CSS file there are also:
//      - .png and .svg icons sprite, 
//      - preloader.gif (for browsers that do not support CSS animations)
import 'photoswipe/dist/default-skin/default-skin.css';

interface PhotoSwipeItem extends PhotoSwipeUI_Default.Item {
    el?: HTMLElement;
}

interface PhotoSwipeOptions extends PhotoSwipeUI_Default.Options {
    galleryPIDs?: boolean;
}

async function getMeta(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = url;
    });
}

const initPhotoSwipeFromDOM = function(gallerySelector: string) {
    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    const parseThumbnailElements = async function(el: Node) {
        let thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl: HTMLElement,
            linkEl,
            size,
            item;

        for(let i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i] as HTMLElement; // <figure> element

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            const dataSize = linkEl.getAttribute('data-size');
            size = dataSize && dataSize.split('x');
            let dimensions: {
                width: number;
                height: number;
            } = {
                width: 0,
                height: 0
            };
            if (size) {
                dimensions = {
                    width: parseInt(size[0], 10),
                    height: parseInt(size[1], 10)
                };
            } else {
                const href = linkEl.getAttribute("href");
                if (href) {
                    let img = await getMeta(href);
                    dimensions = {
                        width: img.width,
                        height: img.height
                    };
                }
            }

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: dimensions.width,
                h: dimensions.height,
                title: '',
                msrc: '',
                el: null as HTMLElement|null,
                pid: i
            } as PhotoSwipeItem;

            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                const msrc = linkEl.children[0].getAttribute('src');
                item.msrc = msrc ? msrc : '';
            }

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    const closest = function closest(el: HTMLElement, fn: Function): HTMLElement|null {
        if (el.parentNode === null) {
            return null;
        }
        return el && ( fn(el) ? el : closest(el.parentNode as HTMLElement, fn) );
    };

    // triggers when user clicks on thumbnail
    const onThumbnailsClick = function(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        const eTarget = (e.target || e.srcElement) as HTMLElement;

        // find root element of slide
        const clickedListItem = eTarget ? closest(eTarget, function(el: HTMLElement) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        }) : null;

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        let clickedGallery = clickedListItem.parentNode as HTMLElement|null,
            childNodes = clickedListItem.parentNode ? clickedListItem.parentNode.childNodes : new NodeList,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index = 0;

        for (let i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0 && clickedGallery !== null) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe(index.toString(), clickedGallery);
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    const photoswipeParseHash = function() {
        const hash = window.location.hash.substring(1),
        params = {} as any;

        if(hash.length < 5) {
            return params;
        }

        const vars = hash.split('&');
        for (let i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            const pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    const openPhotoSwipe = async function(index: string, galleryElement: HTMLElement, disableAnimation = false, fromURL = false) {
        let pswpElement = document.querySelectorAll('.pswp')[0] as HTMLElement,
            gallery,
            options: PhotoSwipeOptions,
            items: PhotoSwipeItem[];

        items = await parseThumbnailElements(galleryElement);

        const uid = galleryElement.getAttribute('data-pswp-uid');
        // define options (if needed)
        options = {
            // define gallery index (for URL)
            galleryUID: parseInt(uid ? uid : '0', 10),
            showHideOpacity: true,
            // getThumbBoundsFn: false,
            // function(index: number) {
            //     const el = items[index].el;
            //     // See Options -> getThumbBoundsFn section of documentation for more info
            //     const thumbnail = el ? el.getElementsByTagName('img')[0] : null, // find thumbnail
            //         pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
            //         rect = thumbnail ? thumbnail.getBoundingClientRect() : null;
            //
            //     if (rect === null) {
            //         return {x: 0, y: pageYScroll, w: 0};
            //     }
            //     return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
            // },
            galleryPIDs: true,
            shareButtons: [
                {id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u='},
                {id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text=&url='},
                {id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url=&media=&description='}
            ]       
        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(let j = 0; j < items.length; j++) {
                    const pid = items[j].pid;
                    if(pid && pid.toString() == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if(typeof options.index !== "undefined" && isNaN(options.index)) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    const galleryElements = document.querySelectorAll(gallerySelector) as NodeListOf<HTMLElement>;

    for(let i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', (i+1).toString());
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    const hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe(hashData.pid,  galleryElements[ hashData.gid - 1 ], true, true);
    }
};

document.addEventListener("DOMContentLoaded", function() {
    // execute above function
    initPhotoSwipeFromDOM('.js-gallery');    
});
