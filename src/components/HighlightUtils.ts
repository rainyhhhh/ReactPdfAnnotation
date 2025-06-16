export interface Position {
    x1: number;
    y1: number; 
    x2: number;
    y2: number;
    pageWidth: number;
    pageHeight: number;
    pageNumber: number;
}

export interface T_LTWH {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Annotation {
    id: string;
    text: string;
    label: string;
    position: Position;
    isSelected?: boolean;
}

export const AnnotationColors = {
    SELECTED: 'rgba(162, 30, 188, 0.2)',
    UNSELECTED: 'rgba(0, 176, 185, 0.2)'
};

export const AnnotationBorderColors = {
    SELECTED: 'rgba(162, 30, 188, 0.5)',    
    UNSELECTED: 'rgba(0, 176, 185, 0.5)'
};

export type PagePosition = {
    pageNumber: number;
    x: number;
    y: number;
}

const temp_rectangle_class = "highlight-temp";
let areaFirstPoint: {x: number, y: number};
let areaSecondPoint: {x: number, y: number};
let transientRectangle: {
    left: number;
    top: number;
    width: number;
    height: number;
}
let currentPagePosition: PagePosition = { pageNumber: 0, x: 0, y: 0 };

export const getCurrentPagePosition = () => currentPagePosition
export const setCurrentPagePosition = (position: PagePosition) => {
    currentPagePosition = position;
}

// ajusts the position to the current page size
export const getScaledPosition = (position: Position, pageSize: { width: number, height: number}): T_LTWH => {
    const x1 = (position.x1 / position.pageWidth) * pageSize.width;
    const y1 = (position.y1 / position.pageWidth) * pageSize.width;
    const x2 = (position.x2 / position.pageWidth) * pageSize.width;
    const y2 = (position.y2 / position.pageWidth) * pageSize.width;
    return {
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1)
    }
}

export const getScaledCorss = (position: Position, targetSize: { width: number, height: number}): Position => {
    
    return {
        x1: (position.x1 / position.pageWidth) * targetSize.width,
        y1: (position.y1 / position.pageWidth) * targetSize.width,    
        x2: (position.x2 / position.pageWidth) * targetSize.width,
        y2: (position.y2 / position.pageWidth) * targetSize.width,
        pageNumber: position.pageNumber,
        pageWidth: targetSize.width,
        pageHeight: targetSize.height
    }
}

export const findParentPageElement = (target: HTMLElement, layer = '.rpv-core__page-layer'): HTMLElement => {
    if (target?.classList?.contains('rpv-core__page-layer')) {
        return target.querySelector('.rpv-core__canvas-layer') as HTMLElement;
    }
    else {
        return findParentPageElement(target.parentElement as HTMLElement, layer);
    }
}

export const findOrCreateContainerLayer = (container: HTMLElement): HTMLElement => {
    let containerLayer = container.querySelector(`.${temp_rectangle_class}`) as HTMLElement;
    if (!containerLayer) {
        containerLayer = document.createElement('div');
        containerLayer.className = temp_rectangle_class;
        container.appendChild(containerLayer);
    }
    return containerLayer
}

export const startTransientRectangle = (lastMousePosition: { x: number, y: number}, element: HTMLElement) => {
    areaFirstPoint = lastMousePosition;
    transientRectangle = {
        left: lastMousePosition.x,
        top: lastMousePosition.y,
        width: 0,
        height: 0
    };
}

export const renderTransientRectangle = (element: HTMLElement) => {
    const tempRectangle = findOrCreateContainerLayer(element);
    if (tempRectangle) {
        tempRectangle.style.left = `${transientRectangle.left}px`;
        tempRectangle.style.top = `${transientRectangle.top}px`;
        tempRectangle.style.width = `${transientRectangle.width}px`;
        tempRectangle.style.height = `${transientRectangle.height}px`;
        tempRectangle.style.position = 'absolute';
        tempRectangle.style.backgroundColor = AnnotationColors.SELECTED;
        tempRectangle.style.border = `2px solid ${AnnotationBorderColors.SELECTED}`;
    }
}

export const calculateArea = (firstPoint: { x: number, y: number}, secondPoint: { x: number, y: number}): T_LTWH => {
    return {
        left: Math.min(firstPoint.x, secondPoint.x),
        top: Math.min(firstPoint.y, secondPoint.y),
        width: Math.abs(secondPoint.x - firstPoint.x),
        height: Math.abs(secondPoint.y - firstPoint.y)
    }
}

export const drawTransientRectangle = (lastMousePosition: { x: number, y: number}, element: HTMLElement) => {   
    areaSecondPoint = lastMousePosition;
    transientRectangle = calculateArea(areaFirstPoint, areaSecondPoint);
    renderTransientRectangle(element);
}

export const getBoundingRect = (): {x1: number, x2: number, y1: number, y2: number} => {
    const { left, top, width, height } = transientRectangle;
    
    return {
        x1: left,
        x2: left + width,
        y1: top,
        y2: top + height
    };
}