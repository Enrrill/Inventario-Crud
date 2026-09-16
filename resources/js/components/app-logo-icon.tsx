import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20 4L6 12V26L20 34L34 26V12L20 4ZM8 13.2L20 6.4L32 13.2V24.8L20 31.6L8 24.8V13.2ZM20 17.6L12 22V28L20 31.6L28 28V22L20 17.6ZM17.2 23.2L14 25.2V27.6L20 30.4L26 27.6V25.2L22.8 23.2L20 24.8L17.2 23.2ZM20 14.4L14 18V21.6L20 24.8L26 21.6V18L20 14.4Z"
            />
        </svg>
    );
}
