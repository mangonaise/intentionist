export default function isValidUsername(username: string) {
  return username.length >= 3
    && username.length <= 30
    && username.match(/^[a-z0-9][a-z0-9]*([_][a-z0-9]+)*$/)
}