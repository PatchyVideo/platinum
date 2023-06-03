import { decompressFromEncodedURIComponent } from 'lz-string'

export function getAdditionalConstraintString(additionalConstraintUrl: string): string {
  if (additionalConstraintUrl === '')
    return ''
  const additionalConstraintObject = JSON.parse(decompressFromEncodedURIComponent(additionalConstraintUrl))
  let additionalConstraintString = ''
  if (additionalConstraintObject.searchContentAndOrNot)
    additionalConstraintString += `${additionalConstraintObject.searchContentAndOrNot} `
  if (additionalConstraintObject.exceptContent) {
    const exceptContentArray = additionalConstraintObject.exceptContent.trim().split(' ')
    for (let i = 0; i < exceptContentArray.length; i++)
      additionalConstraintString += `NOT ${exceptContentArray[i]} `
  }
  if (additionalConstraintObject.visibleSites?.length) {
    if (additionalConstraintObject.visibleSites.findIndex((item: string) => item === '') === -1) {
      let sites = ''
      for (let i = 0; i < additionalConstraintObject.visibleSites.length; i++)
        sites += `site:${additionalConstraintObject.visibleSites[i]} `

      additionalConstraintString += `ANY(${sites}) `
    }
  }
  if (
    additionalConstraintObject.date1?.beforeAfterEqualDate1
    && additionalConstraintObject.date1.beforeAfterEqualDate1 !== ''
  ) {
    additionalConstraintString
      += `date:${
       additionalConstraintObject.date1.beforeAfterEqualDate1
       }${additionalConstraintObject.date1.year1
       }-${
       additionalConstraintObject.date1.month1
       }-${
       additionalConstraintObject.date1.day1
       } `
  }
  if (
    additionalConstraintObject.date2?.beforeAfterEqualDate2
    && additionalConstraintObject.date2.beforeAfterEqualDate2 !== ''
  ) {
    additionalConstraintString
      += `date:${
       additionalConstraintObject.date2.beforeAfterEqualDate2
       }${additionalConstraintObject.date2.year2
       }-${
       additionalConstraintObject.date2.month2
       }-${
       additionalConstraintObject.date2.day2
       } `
  }
  if (additionalConstraintObject.tag.moreLessEqualTagNum && additionalConstraintObject.tag.moreLessEqualTagNum !== '') {
    additionalConstraintString
      += `tags:${additionalConstraintObject.tag.moreLessEqualTagNum}${additionalConstraintObject.tag.tagNum} `
  }
  if (
    additionalConstraintObject.onlyShowAutotagedVideos
    && !additionalConstraintObject.searchContentAndOrNot.test(/Auto_tagged/)
    && !additionalConstraintObject.exceptContent.test(/Auto_tagged/)
  )
    additionalConstraintString += 'Auto_tagged '

  return additionalConstraintString
}
