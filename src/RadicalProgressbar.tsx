import styles from './RadicalProgressbar.module.css';
export const RadicalProgressbar = (props: {progress: number}) => {
  return (
    <svg
      width="190"
      height="190"
      viewBox="0 0 250 250"
      class={styles.circularProgress}
      style={"--progress: " + props.progress}
    >
      <circle class={styles.bg}></circle>
      <circle class={styles.fg}></circle>
    </svg>
  )
}