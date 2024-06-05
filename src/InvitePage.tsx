import { For, createSignal } from "solid-js"


const questions = [
  {
    question: "How does the referral program work?",
    answer: "Share your referral link with a friend. After they buy a PrivateVPN subscription, we'll instantly add 3 months to your account. Your friend will also be instantly rewarded — with a free month for buying a monthly plan or 3 months for a 1-year or 2-year plan purchase."
  },
  {
    question: "Can I refer friends who've used PrivateVPN before?",
    answer: "Unfortunately, no. The referral program is for introducing PrivateVPN to new users who've never tried our product before."
  },
  {
    question: "Is there a limit to how many referrals I can make?",
    answer: "There are no limits! You can refer as many friends as you like — you'll instantly get 3 free months of PrivateVPN for every successful referral."
  },
  {
    question: "How will I know my referral's been successful?",
    answer: "We'll drop you an email. And if your referral hasn't worked out, we'll let you know by email, too — so you can try again by referring someone else."
  }
]
const Page = () => {
  return (
    <div class="w-full h-full flex flex-col items-center justify-center">
      <div class="text-40px font-600">Frequently asked questions</div>

      <div class="flex flex-col gap-4 m-t-4">
        <For each={questions}>
          {(data) => <Item question={data.question} answer={data.answer} />}
        </For>
      </div>
    </div>
  )
}


const Item = (props: { question: string, answer: string }) => {
  const [expand, setExpand] = createSignal(false)

  return (
    <div class="rd-12px bg-white p-4 max-w-746px b-1px b-#E2E2E4 cursor-pointer" onClick={() => setExpand(!expand())}>
      <div class="text-20px font-400 flex ">
        {props.question}
        <img src="assets/arrow-down-dark.svg" class="m-l-auto transition-duration-120" classList={{["rotate-180"]: expand()}}  />
        </div>
      <div class="text-14px font-400 color-#2A2B32CC transition-duration-120" classList={{["grid grid-rows-[1fr]"]: expand(), ["grid grid-rows-[0fr]"]: !expand()}}>
        <div class="overflow-hidden">
          {props.answer}
        </div>
      </div>
    </div>
  )

}

export default Page