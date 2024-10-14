# Linkyou

Linkyou is a Web Hiring Platform Application

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure sign-up and login with options for social media authentication.
- **Link Management**: Easily add, edit, and delete links.
- **Categories**: Organize links into customizable categories.
- **User Profiles**: Each user has a personalized profile with their jobs.
- **Responsive Design**: Works seamlessly on desktops and mobile devices.

## Technologies Used

- **Frontend**: 
  - React.js + vite
  - Tailwind CSS
- **Backend**:
  - supabase(Database)
  - Nodejs 
- **Authentication**:
  - Clerk
- **Deployment**:
  - Vercel
- **Others**:
  - Axios (for API calls)
  - dotenv (for environment variables)

## Installation

To run the Linkyou website locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/linkyou.git
   cd linkyou
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```plaintext
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_CLERK_PUBLISHABLE_KEY
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and go to `http://localhost:1573`.

## Usage

Once the application is running, you can:

- Sign up or log in to your account.
- Click on Professional to apply for jobs or on Recruiter to post a job.
- Explore job to apply and then submit.
- Post job with assessment
  
## Web Link of vercel deployment:
  https://link-you-zeta.vercel.app/

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to customize this README to fit your project's specific requirements, such as changing the project name, adding more details about the API, or providing examples of how to use certain features. Having a well-structured README will help users and developers understand and contribute to your project more effectively.
```

### Notes:

- Replace placeholders like `yourusername` and `<your-clerk-frontend-api>` with the actual values relevant to your project.
- Add more details under each section if needed, especially for features and usage, based on what your application offers.
- Consider adding a **Screenshots** section to showcase the UI of the application visually.
- Make sure to include any other relevant sections based on your project’s complexity and requirements.
