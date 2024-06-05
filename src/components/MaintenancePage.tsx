export const MaintenancePage = (props: {variant: 1 | 2 | 3 | 4}) => {

    return (
        <div class="flex w-full h-full items-center justify-center flex-col">


            <img src={`assets/maintenance${props.variant}.svg`} alt="" />
            <div class="bg-#FFFFFF rd-8px p-3">
                <div class="text-14px font-500">Sorry, Maintenance</div>
                <div class="text-12px font-500 color-#00091F66">We are running maintenance for this specific features.<br />New Servers and data transfers Are happening right now.</div>
            </div>
        </div>
    )


}