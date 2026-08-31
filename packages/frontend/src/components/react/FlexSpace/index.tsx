import Styles from './FlexSpace.module.scss';

// Flex spacer: an invisible flex item that grows to fill available space.
// Styled with SCSS (`./FlexSpace.module.scss`) rather than Emotion.
const FlexSpace = () => <div className={Styles['flex-space']} />;

export default FlexSpace;
