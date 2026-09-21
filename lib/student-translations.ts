export type StudentLanguage = "en" | "km";

export const studentTranslations = {
  en: {
    home: "Home",
    back: "Back",
    courseProgress: "Course progress",
    inProgress: "In Progress",
    completed: "Completed",
    course: "Course",
    courses: "Courses",
    chapters: "Chapters",
    freeToJoin: "Free to join",
    subscribing: "Subscribing...",
    subscribe: "Subscribe",
    startCourse: "Start course",
    unableToSubscribe: "Unable to subscribe to this course",
    allCourses: "All courses",
    myCourses: "My courses",
    category: "Category",
    analytics: "Analytics",
    users: "Users",
    manageCourses: "Manage courses",
    exit: "Exit",
    teacherMode: "Teacher mode",
    lockedChapter: "This chapter is locked",
    alreadyCompleted: "You already completed this chapter.",
    purchaseRequired: "You need to purchase this course to watch this chapter.",
    watchToComplete: "Watch the full video to complete",
    nextLesson: "Next lesson",
    markComplete: "Mark as complete",
    markIncomplete: "Mark as not completed",
    progressUpdated: "Progress updated",
    somethingWentWrong: "Something went wrong",
    english: "English",
    khmer: "ខ្មែរ",
  },
  km: {
    home: "ទំព័រដើម",
    back: "ត្រឡប់ក្រោយ",
    courseProgress: "វឌ្ឍនភាពវគ្គសិក្សា",
    inProgress: "កំពុងសិក្សា",
    completed: "បានបញ្ចប់",
    course: "វគ្គសិក្សា",
    courses: "វគ្គសិក្សា",
    chapters: "មេរៀន",
    freeToJoin: "អាចចូលរៀនដោយឥតគិតថ្លៃ",
    subscribing: "កំពុងចុះឈ្មោះ...",
    subscribe: "ចុះឈ្មោះ",
    startCourse: "ចូលមើលមេរៀន",
    unableToSubscribe: "មិនអាចចុះឈ្មោះចូលវគ្គសិក្សានេះបានទេ",
    allCourses: "មេរៀនសិក្សាទាំងអស់",
    myCourses: "មេរៀនរបស់ខ្ញុំ",
    category: "ប្រភេទ",
    analytics: "ស្ថិតិ",
    users: "អ្នកប្រើប្រាស់",
    manageCourses: "គ្រប់គ្រងវគ្គសិក្សា",
    exit: "ចាកចេញ",
    teacherMode: "មុខងារគ្រូ",
    lockedChapter: "មេរៀននេះត្រូវបានចាក់សោ",
    alreadyCompleted: "អ្នកបានបញ្ចប់មេរៀននេះរួចហើយ។",
    purchaseRequired: "អ្នកត្រូវទិញវគ្គសិក្សានេះ ដើម្បីមើលមេរៀននេះ។",
    watchToComplete: "មើលវីដេអូពេញ ដើម្បីបញ្ចប់មេរៀន",
    nextLesson: "មេរៀនបន្ទាប់",
    markComplete: "សម្គាល់ថាបានបញ្ចប់",
    markIncomplete: "សម្គាល់ថាមិនទាន់បញ្ចប់",
    progressUpdated: "បានធ្វើបច្ចុប្បន្នភាពវឌ្ឍនភាព",
    somethingWentWrong: "មានបញ្ហាកើតឡើង",
    english: "អង់គ្លេស",
    khmer: "ខ្មែរ",
  },
} as const;

export type StudentTranslations = (typeof studentTranslations)[StudentLanguage];

export function getStudentLanguage(value?: string): StudentLanguage {
  return value === "km" ? "km" : "en";
}

export function getStudentTranslations(language?: string): StudentTranslations {
  return studentTranslations[getStudentLanguage(language)];
}
