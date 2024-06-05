const Search = (props: {placeholder: string, onText?: (text: string) => void}) => {
  return (
    <div class="bg-white rd-8px h-56px w-full p-x-4 flex ">
      <input onInput={e => props.onText?.(e.currentTarget.value)} type="text" placeholder={props.placeholder} class="text-14px bg-transparent outline-none h-full w-full color-black" />
      <img src="assets/search.svg" class="w-24px"  />
    </div>
  )
}
export {Search}