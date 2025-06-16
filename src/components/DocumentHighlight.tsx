import { AnnotationBorderColors, AnnotationColors, type Annotation, type T_LTWH } from "./HighlightUtils"

type DocumentHighlightProps = {
    scaledPosition: T_LTWH
    annotation: Annotation
}

export const DocumentHighlight = ({
    scaledPosition,
    annotation,
}: DocumentHighlightProps) => {
    const getRect = () => {
        const color = annotation.isSelected ? 'SELECTED' : 'UNSELECTED';
        return {
            width: scaledPosition.width + 'px',
            height: scaledPosition.height + 'px',
            transform: `translate3d(${scaledPosition.left}px, ${scaledPosition.top}px, 0)`,
            backgroundColor: `${AnnotationColors[color]}`,
            border: `1px solid ${AnnotationBorderColors[color]}`,
            position: "absolute",
            zIndex: annotation.isSelected ? 1000 : 500,
        } as React.CSSProperties;
    };
    return (
        <div
            className="annotation-highlight"
            data-testid={`annotation-${annotation.id}`}
            style={getRect()}
        >
        </div>
    );
};